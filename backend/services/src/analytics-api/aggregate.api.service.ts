import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { DataCountResponseDto } from "../shared/dto/data.count.response";
import { Programme } from "../shared/entities/programme.entity";
import { Repository } from "typeorm";
import { StatList } from "../shared/dto/stat.list.dto";
import { StatType } from "../shared/enum/stat.type.enum";
import { HelperService } from "../shared/util/helpers.service";
import { QueryDto } from "../shared/dto/query.dto";
import { FilterEntry } from "../shared/dto/filter.entry";
import { SortEntry } from "../shared/dto/sort.entry";
import { AggrEntry } from "../shared/dto/aggr.entry";
import { Company } from "../shared/entities/company.entity";
import { StatFilter } from "../shared/dto/stat.filter";
import { ProgrammeStage } from "../shared/enum/programme-status.enum";
import { Stat } from "../shared/dto/stat.dto";
import { Sector } from "../shared/enum/sector.enum";
import {
  StatusGroupedByTimedata,
  StatusGroupedByTimedataThere,
} from "../shared/dto/programmeStatus.timeGrouped.result";
import { TransferStatus } from "../shared/enum/transform.status.enum";
import { CompanyRole } from "../shared/enum/company.role.enum";
import { PRECISION } from "../shared/constants";
import { NDCActionViewEntity } from "../shared/entities/ndc.view.entity";

@Injectable()
export class AggregateAPIService {
  private timeDropFields = [
    "certifierId",
    "companyId",
    "revokedCertifierId",
    "toCompanyId",
    "fromCompanyId",
    "programmeCertifierId",
    "initiatorCompanyId",
    "isRetirement",
    "createdTime"
  ]

  constructor(
    private configService: ConfigService,
    private helperService: HelperService,
    @InjectRepository(Programme) private programmeRepo: Repository<Programme>,
    @InjectRepository(NDCActionViewEntity) private ndcRepo: Repository<NDCActionViewEntity>,
    @InjectRepository(Company) private companyRepo: Repository<Company>,
  ) {}

  private getFilterAndByStatFilter(
    statFilter: StatFilter,
    mineFilter: FilterEntry,
    timeField: string
  ) {
  const filters: FilterEntry[] = [];
    if (statFilter) {
      if (statFilter.startTime) {
        filters.push({
          key: timeField,
          operation: ">=",
          value: statFilter.startTime,
        });
      }
      if (statFilter.endTime) {
        filters.push({
          key: timeField,
          operation: "<=",
          value: statFilter.endTime,
        });
      }
      if (statFilter.onlyMine == true && mineFilter) {
        filters.push(mineFilter);
      }

      return filters;
    } else {
      return null;
    }
  }

  private async getLastTime(
    repo: Repository<any>,
    tableName: string,
    whereC: string,
    timeCol: string
  ) {
    console.log("getLastTime", whereC);
    const resp = await repo
      .createQueryBuilder(tableName)
      .select(`"${timeCol}"`)
      .where(whereC)
      .orderBy(`"${timeCol}"`, "DESC", "NULLS LAST")
      .limit(1)
      .getRawOne();

    console.log("Resp", resp);
    if (resp) {
      return resp[timeCol];
    }
    return 0;
  }

  private firstLower(lower) {
    return (lower && lower[0].toLowerCase() + lower.slice(1)) || lower;
  }

  private async getTimeGroupedDataStatusConverted(data) {
    const passedResult = data;
    let result: StatusGroupedByTimedata = {
      awaitingAuthorization: [],
      authorised: [],
      rejected: [],
      authorisedCredits: [],
      issuedCredits: [],
      transferredCredits: [],
      retiredCredits: [],
      frozenCredits: [],
    };
    const groupedDataFiltered = passedResult?.filter(
      (item) => String(item.time_group) !== "0"
    );
    const groupedDatasObject = groupedDataFiltered.reduce((acc, curr) => {
      const time_group = curr.time_group;
      if (!acc[time_group]) {
        acc[time_group] = [];
      }
      acc[time_group].push(curr);
      return acc;
    }, {});
    const timeLabel = Object.getOwnPropertyNames(groupedDatasObject);
    timeLabel?.map((timeLabelItem) => {
      const arrResultForTimeGroup = groupedDatasObject[timeLabelItem];
      let authorisedCreditsSum = 0;
      let issuedCreditsSum = 0;
      let transferredCreditsSum = 0;
      let retiredCreditsSum = 0;
      let frozenCreditsSum = 0;
      let resultThere: StatusGroupedByTimedataThere = {
        awaitingAuthorization: false,
        authorised: false,
        rejected: false,
      };
      const statusArray = Object.values(ProgrammeStage);
      arrResultForTimeGroup?.map((timeGroupItem) => {
        console.log("status array ----- > ", statusArray);
        if (timeGroupItem?.currentStage === ProgrammeStage.AUTHORISED) {
          authorisedCreditsSum =
            authorisedCreditsSum +
            (parseFloat(timeGroupItem?.totalestcredit) -
              parseFloat(timeGroupItem?.totalissuedcredit));
        } else {
          authorisedCreditsSum = authorisedCreditsSum + 0;
        }
        issuedCreditsSum =
          issuedCreditsSum +
          parseFloat(timeGroupItem?.totalissuedcredit) -
          parseFloat(timeGroupItem?.totalretiredcredit) -
          parseFloat(timeGroupItem?.totaltxcredit) -
          parseFloat(timeGroupItem?.totalfreezecredit);
        transferredCreditsSum =
          transferredCreditsSum + parseFloat(timeGroupItem?.totaltxcredit);
        retiredCreditsSum =
          retiredCreditsSum + parseFloat(timeGroupItem?.totalretiredcredit);
        frozenCreditsSum =
          frozenCreditsSum + parseFloat(timeGroupItem?.totalfreezecredit);
        statusArray?.map((status) => {
          if (timeGroupItem?.currentStage === status) {
            resultThere[this.firstLower(timeGroupItem?.currentStage)] = true;
            result[this.firstLower(timeGroupItem?.currentStage)]?.push(
              parseInt(timeGroupItem?.count)
            );
          }
        });
      });
      statusArray?.map((status) => {
        if (resultThere[this.firstLower(status)] === false) {
          result[this.firstLower(status)]?.push(0);
        }
      });
      result["authorisedCredits"]?.push(authorisedCreditsSum);
      result["issuedCredits"]?.push(issuedCreditsSum);
      result["transferredCredits"]?.push(transferredCreditsSum);
      result["retiredCredits"]?.push(retiredCreditsSum);
      result["frozenCredits"]?.push(frozenCreditsSum);
    });

    const resultS = {
      timeLabel,
      ...result,
    };
    return resultS;
  }

  private async getTimeGroupedDataSectorConverted(data) {
    const passedResult = data;
    const groupedDataFiltered = passedResult?.filter(
      (item) => String(item.time_group) !== "0"
    );
    const groupedDatasObject = groupedDataFiltered.reduce((acc, curr) => {
      const time_group = curr.time_group;
      if (!acc[time_group]) {
        acc[time_group] = [];
      }
      acc[time_group].push(curr);
      return acc;
    }, {});
    let result: any = {};
    const sectorsArray = Object.values(Sector);
    sectorsArray?.map((sector) => {
      result[this.firstLower(sector)] = [];
    });
    const timeLabel = Object.getOwnPropertyNames(groupedDatasObject);
    for (let timeIndex = 0; timeIndex < timeLabel.length; timeIndex++) {
      const arrResultForTimeGroup = groupedDatasObject[timeLabel[timeIndex]];
      let resultThere: any = {};
      const sectorsArray = Object.values(Sector);
      sectorsArray?.map((sector) => {
        resultThere[this.firstLower(sector)] = false;
      });
      for (
        let arrResultForTimeGroupIndex = 0;
        arrResultForTimeGroupIndex < arrResultForTimeGroup.length;
        arrResultForTimeGroupIndex++
      ) {
        sectorsArray?.map((sector) => {
          if (
            arrResultForTimeGroup[arrResultForTimeGroupIndex]?.sector === sector
          ) {
            resultThere[
              arrResultForTimeGroup[
                arrResultForTimeGroupIndex
              ]?.sector?.toLowerCase()
            ] = true;
            result[
              arrResultForTimeGroup[
                arrResultForTimeGroupIndex
              ]?.sector?.toLowerCase()
            ]?.push(
              parseInt(arrResultForTimeGroup[arrResultForTimeGroupIndex]?.count)
            );
          }
        });
      }
      sectorsArray?.map((sector) => {
        if (resultThere[sector?.toLocaleLowerCase()] === false) {
          result[sector?.toLocaleLowerCase()]?.push(0);
        }
      });
    }

    const resultS = {
      timeLabel,
      ...result,
    };

    return resultS;
  }

  private async programmeLocationDataFormatter(data) {
    const locationData = [...data];
    let locationsGeoData: any = {};
    let features: any[] = [];
    locationsGeoData.type = "FeatureCollection";
    locationData?.map((locationDataItem, index) => {
      if (locationDataItem?.loc && locationDataItem !== null) {
        let programmeGeoData: any = {};
        let location: any = locationDataItem?.loc;
        programmeGeoData.type = "Feature";
        let properties: any = {};
        let geometry: any = {};
        properties.id = String(index);
        properties.count = parseInt(locationDataItem?.count);
        properties.stage = locationDataItem?.stage;
        geometry.type = "Point";
        geometry.coordinates = location;
        programmeGeoData.properties = properties;
        programmeGeoData.geometry = geometry;
        features.push(programmeGeoData);
      }
    });

    locationsGeoData.features = [...features];
    return locationsGeoData;
  }

  private async genAggregateTypeOrmQuery(
    repo: Repository<any>,
    tableName: string,
    groupBy: string[],
    aggregates: AggrEntry[],
    filterAnd: FilterEntry[],
    filterOr: FilterEntry[],
    sort: SortEntry,
    abilityCondition: string,
    lastTimeForWhere: any,
    statCache: any,
    timeCol: string[],
    timeGroupingCol?: string,
    timeGroupingAccuracy?: string,
    keepTimeFields?: string[]
  ) {
    const query = new QueryDto();
    query.filterAnd = filterAnd;
    query.filterOr = filterOr;
    query.sort = sort;

    const timeFields = [
      ...timeCol
    ];

    for (const t of this.timeDropFields) {
      if (keepTimeFields && keepTimeFields.indexOf(t) >= 0) {
        continue;
      }
      timeFields.push(t)
    }

    console.log('Time fields', timeFields)

    const whereC = this.helperService.generateWhereSQL(
      query,
      this.helperService.parseMongoQueryToSQLWithTable(
        tableName,
        abilityCondition
      )
    );

    const timeWhere = this.helperService.generateWhereSQL(
      query,
      this.helperService.parseMongoQueryToSQLWithTable(
        tableName,
        abilityCondition
      ),
      undefined,
      timeFields
    );

    let queryBuild = repo.createQueryBuilder(tableName).where(whereC);

    if (aggregates) {
      const selectQuery = aggregates
        .map((a) => {
          const fieldCol = `${
            a.outerQuery ? "(" + a.outerQuery + "(" : ""
          }"${tableName}"."${a.key}"${a.outerQuery ? ")s )" : ""}`;

          let mineCompField = fieldCol;
          if (a.mineCompanyId) {
            mineCompField = [
              "creditTransferred",
              "creditRetired",
              "creditFrozen",
            ].includes(a.key)
              ? `"${tableName}"."${a.key}"[array_position("${tableName}"."companyId", ${a.mineCompanyId})]`
              : `"${tableName}"."${
                  a.key === "creditBalance"
                    ? "creditOwnerPercentage"
                    : "proponentPercentage"
                }"[array_position("${tableName}"."companyId", ${
                  a.mineCompanyId
                })]*${fieldCol}/100`;
          }
          return `${a.operation}(${mineCompField}) as ${a.fieldName}`;
        })
        .join(",");
      queryBuild = queryBuild.select(selectQuery);
    }

    if (sort) {
      queryBuild = queryBuild.orderBy(
        sort?.key && `"${sort?.key}"`,
        sort?.order,
        "NULLS LAST"
      );
    }

    let grpByAll = undefined;
    if (groupBy) {
      const groupQuery = groupBy
        .map((gb) => {
          let val;
          if (gb.includes("->>")) {
            const parts = gb.split("->>");
            val = `"${parts[0]}"->>'${parts[1]}'`;
          } else {
            val = `"${gb}"`;
          }
          return `"${tableName}".${val}`;
        })
        .join(",");
      const groupSelectQuery = groupBy
        .map((gb) => {
          let val;
          if (gb.includes("->>")) {
            const parts = gb.split("->>");
            val = `"${parts[0]}"->>'${parts[1]}' as ${parts[1]}`;
          } else {
            val = `"${gb}"`;
          }
          return `"${tableName}".${val}`;
        })
        .join(",");
      queryBuild = queryBuild.addSelect(groupSelectQuery);
      grpByAll = groupQuery;
    }
    if (timeGroupingCol && timeGroupingAccuracy) {
      const groupQuery = `date_trunc('${timeGroupingAccuracy}', "${timeGroupingCol}") as time_group`;
      queryBuild = queryBuild.addSelect(groupQuery);
      if (!grpByAll) {
        grpByAll = "time_group";
      } else {
        grpByAll += ", time_group";
      }
    }
    if (grpByAll != "") {
      queryBuild = queryBuild.groupBy(grpByAll);
    }

    const key =
      (grpByAll ? grpByAll : "") + " " + whereC + " from " + tableName + ' ' + timeWhere;
    console.log('Stat cache key', key)
    if (statCache[key]) {
      return statCache[key];
    }
    let d = await queryBuild.getRawMany();
    let dTimeGrouped;

    let lastTime: any;
    if (timeCol) {
      const allTimes = {};
      let maxTime = 0;
      let colTime;
      for (const tc of timeCol) {
        const cacheKey = timeWhere + " " + tc + " from " + tableName;
        console.log("Cache key", cacheKey);
        if (lastTimeForWhere[cacheKey]) {
          console.log("Last time hit from the cache");
          colTime = lastTimeForWhere[cacheKey];
        } else {
          colTime = await this.getLastTime(repo, tableName, timeWhere, tc);
          lastTimeForWhere[cacheKey] = colTime;
        }
        allTimes[tc] = colTime;
        if (colTime > maxTime) {
          maxTime = colTime;
        }
        lastTime = {
          max: maxTime,
          all: allTimes,
        };
      }
    }
    for (const row of d) {
      for (const k in row) {
        if (row[k] === null) {
          row[k] = 0;
        } else if (row[k] !== undefined && !isNaN(row[k]) && row[k] % 1 !== 0) {
          row[k] = parseFloat(Number(row[k]).toFixed(PRECISION));
        }
      }
    }
    if (timeGroupingCol && timeGroupingAccuracy && groupBy) {
      console.log("coming into this condition ---- groupBy[0]", groupBy[0]);
      if (groupBy[0] === "currentStage") {
        dTimeGrouped = await this.getTimeGroupedDataStatusConverted(d);
      } else if (groupBy[0] === "sector") {
        dTimeGrouped = await this.getTimeGroupedDataSectorConverted(d);
      }
    } else if (timeGroupingCol && timeGroupingAccuracy) {
      console.log("coming into this condition ---- !groupBy[0]");
      const map = {};
      for (const en of d) {
        if (!map[en.time_group]) {
          map[en.time_group] = [];
        }
        map[en.time_group].push(en);
      }
      dTimeGrouped = map;
    }
    statCache[key] = {
      data: timeGroupingCol && timeGroupingAccuracy ? dTimeGrouped : d,
      last: lastTime.max,
    };

    if (lastTime.all && Object.keys(lastTime.all).length > 0) {
      statCache[key]["all"] = lastTime.all;
    }

    return statCache[key];
  }

  private async getAllAuthProgramme(
    stat,
    abilityCondition,
    lastTimeForWhere,
    statCache,
    timeGroup: boolean,
    companyId?
  ) {
    let filtAuth = this.getFilterAndByStatFilter(
      stat.statFilter,
      companyId
        ? {
            value: companyId,
            key: "companyId",
            operation: "ANY",
          }
        : undefined,
      "createdTime"
    );

    if (!filtAuth) {
      filtAuth = [];
    }
    filtAuth.push({
      value: ProgrammeStage.AUTHORISED,
      key: "currentStage",
      operation: "=",
    });

    return await this.genAggregateTypeOrmQuery(
      this.programmeRepo,
      "programme",
      null,
      [
        new AggrEntry("programmeId", "COUNT", "count"),
        {
          key: "creditEst",
          operation: "SUM",
          fieldName: "sum",
          mineCompanyId:
            stat?.statFilter?.onlyMine && companyId ? companyId : undefined,
        },
      ],
      filtAuth,
      null,
      timeGroup ? { key: "time_group", order: "ASC" } : null,
      abilityCondition,
      lastTimeForWhere,
      statCache,
      ["statusUpdateTime", "authTime"],
      timeGroup ? "createdAt" : undefined,
      timeGroup ? "day" : undefined
    );
  }

  private async getCertifiedByMePrgrammes(
    statFilter,
    companyId,
    certifyField,
    abilityCondition,
    lastTimeForWhere,
    statCache,
    companyRole,
    timeGroup?: boolean
  ) {
    let filtC = this.getFilterAndByStatFilter(
      statFilter,
      {
        value: companyId,
        key: certifyField,
        operation: "ANY",
      },
      "createdTime"
    );

    if (!filtC) {
      filtC = [];
    }
    filtC.push({
      value: ProgrammeStage.AUTHORISED,
      key: "currentStage",
      operation: "=",
    });

    return await this.genAggregateTypeOrmQuery(
      this.programmeRepo,
      "programme",
      null,
      [
        new AggrEntry("programmeId", "COUNT", "count"),
        new AggrEntry("creditEst", "SUM", "sum"),
        {
          key: "creditEst",
          operation: "SUM",
          fieldName: "sum",
          mineCompanyId:
            statFilter?.onlyMine &&
            companyId &&
            companyRole === CompanyRole.PROGRAMME_DEVELOPER
              ? companyId
              : undefined,
        },
      ],
      filtC,
      null,
      null,
      abilityCondition,
      lastTimeForWhere,
      statCache,
      ["certifiedTime"],
      timeGroup ? "createdAt" : undefined,
      timeGroup ? "day" : undefined
    );
  }

  private async getCertifiedProgrammes(
    statFilter,
    abilityCondition,
    lastTimeForWhere,
    statCache,
    companyId,
    cardinalityFilters: FilterEntry[],
    frzAgg,
    companyField: string,
    companyRole: CompanyRole,
    timeGroup?: boolean
  ) {
    let filters = this.getFilterAndByStatFilter(
      statFilter,
      null,
      "createdTime"
    );
    if (!filters) {
      filters = [];
    }
    for (const fl of cardinalityFilters) {
      filters.push({
        key: fl.key,
        operation: fl.operation,
        value: fl.value,
        keyOperation: "cardinality",
      });
    }

    filters.push({
      value: ProgrammeStage.AUTHORISED,
      key: "currentStage",
      operation: "=",
    });

    let filterOr = undefined;
    if (statFilter && statFilter.onlyMine) {
      filterOr = [
        {
          value: companyId,
          key: companyField,
          operation: "ANY",
        },
        {
          value: companyId,
          key: "companyId",
          operation: "ANY",
        },
      ];
    }

    frzAgg.mineCompanyId =
      statFilter?.onlyMine && companyRole === CompanyRole.PROGRAMME_DEVELOPER
        ? companyId
        : undefined;
    return await this.genAggregateTypeOrmQuery(
      this.programmeRepo,
      "programme",
      null,
      [
        new AggrEntry("programmeId", "COUNT", "count"),
        {
          key: "creditEst",
          operation: "SUM",
          fieldName: "totalEstCredit",
          mineCompanyId: frzAgg.mineCompanyId,
        },
        {
          key: "creditIssued",
          operation: "SUM",
          fieldName: "totalIssuedCredit",
          mineCompanyId: frzAgg.mineCompanyId,
        },
        {
          key: "creditBalance",
          operation: "SUM",
          fieldName: "totalBalanceCredit",
          mineCompanyId: frzAgg.mineCompanyId,
        },
        {
          key: "creditRetired",
          operation: "SUM",
          fieldName: "totalRetiredCredit",
          mineCompanyId: frzAgg.mineCompanyId,
          outerQuery: "select sum(s) from unnest",
        },
        {
          key: "creditTransferred",
          operation: "SUM",
          fieldName: "totalTxCredit",
          mineCompanyId: frzAgg.mineCompanyId,
          outerQuery: "select sum(s) from unnest",
        },
        frzAgg,
      ],
      filters,
      filterOr,
      timeGroup ? { key: "time_group", order: "ASC" } : null,
      abilityCondition,
      lastTimeForWhere,
      statCache,
      ["certifiedTime"],
      timeGroup ? "createdAt" : undefined,
      timeGroup ? "day" : undefined
    );
  }

  async calcStat(
    stat: Stat,
    results,
    abilityCondition,
    lastTimeForWhere,
    statCache,
    companyId,
    companyRole
  ) {
    const key = stat.key ? stat.key : stat.type;
    console.log(stat.type)
    switch (stat.type) {
      case StatType.MY_AGG_PROGRAMME_BY_SECTOR:
      case StatType.AGG_PROGRAMME_BY_SECTOR:
        results[key] = await this.generateProgrammeAggregates(
          stat,
          abilityCondition,
          lastTimeForWhere,
          statCache,
          companyId
        );
        break;
      case StatType.MY_AGG_NDC_ACTION_BY_SECTOR:
      case StatType.AGG_NDC_ACTION_BY_SECTOR:
      case StatType.MY_AGG_NDC_ACTION_BY_TYPE:
      case StatType.AGG_NDC_ACTION_BY_TYPE:
        results[key] = await this.generateNDCAggregates(
          stat,
          abilityCondition,
          lastTimeForWhere,
          statCache,
          companyId
        );
        break;
      case StatType.MY_TOTAL_EMISSIONS:
      case StatType.TOTAL_EMISSIONS:
        results[key] = await this.getEmissions(
          stat,
          companyId,
          abilityCondition,
          lastTimeForWhere,
          statCache
        );
        break;
      
      case StatType.PROGRAMME_LOCATION:
      case StatType.MY_PROGRAMME_LOCATION:
        if (stat.type === StatType.MY_PROGRAMME_LOCATION) {
          stat.statFilter
            ? (stat.statFilter.onlyMine = true)
            : (stat.statFilter = { onlyMine: true });
        }
        const whereC = [];
        whereC.push(`p."programmeId" != 'null'`);
        if (stat.statFilter && stat.statFilter.onlyMine) {
          whereC.push(
            `(${companyId} = ANY(b."companyId") or ${companyId} = ANY(b."certifierId"))`
          );
        }
        if (stat.statFilter && stat.statFilter.startTime) {
          whereC.push(`"createdTime" >= ${stat.statFilter.startTime}`);
        }
        if (stat.statFilter && stat.statFilter.endTime) {
          whereC.push(`"createdTime" <= ${stat.statFilter.endTime}`);
        }

        console.log('Query', `SELECT p."programmeId" as loc, b."currentStage" as stage, count(*) AS count
        FROM   programme b, jsonb_array_elements(b."geographicalLocationCordintes") p("programmeId")
        ${whereC.length > 0 ? " where " : " "}
        ${whereC.join(" and ")}
        GROUP  BY p."programmeId", b."currentStage"`)

        const resultsProgrammeLocations = await this.programmeRepo.manager
          .query(`SELECT p."programmeId" as loc, b."currentStage" as stage, count(*) AS count
          FROM   programme b, jsonb_array_elements(b."geographicalLocationCordintes") p("programmeId")
          ${whereC.length > 0 ? " where " : " "}
          ${whereC.join(" and ")}
          GROUP  BY p."programmeId", b."currentStage"`);
        results[key] = await this.programmeLocationDataFormatter(
          resultsProgrammeLocations
        );

        
        results[key]['last'] = await this.getProgrammeLocationTime(whereC.slice(1), lastTimeForWhere);
        break;
    }
    console.log('Calc stat done', stat.type)
    return results;
  }

  async getProgrammeLocationTime(whereC: string[], lastTimeForWhere: any) {
    const tc = 'createdTime'
    const tableName = 'programme'
    const timeWhere = whereC.join(" and ").replace(/b./g, "programme.");
    const cacheKey = timeWhere + " " + tc + " from " + tableName;
    let colTime;
    console.log("Cache key", cacheKey);
    if (lastTimeForWhere[cacheKey]) {
      console.log("Last time hit from the cache");
      colTime = lastTimeForWhere[cacheKey];
    } else {
      colTime = await this.getLastTime(this.programmeRepo, tableName, timeWhere, tc);
      lastTimeForWhere[cacheKey] = colTime;
    }
    return colTime;
  }

  async getCertifiedRevokedAgg(
    stat: Stat,
    results,
    abilityCondition,
    lastTimeForWhere,
    statCache,
    companyId,
    frzAgg,
    companyRole
  ): Promise<any> {
    const revoked = await this.getCertifiedProgrammes(
      stat.statFilter,
      abilityCondition,
      lastTimeForWhere,
      statCache,
      companyId,
      [{ key: "certifierId", operation: "=", value: 0 }],
      frzAgg,
      "revokedCertifierId",
      companyRole,
      stat.statFilter?.timeGroup ? true : false
    );

    const allAuth = await this.getAllAuthProgramme(
      stat,
      abilityCondition,
      lastTimeForWhere,
      statCache,
      stat.statFilter?.timeGroup ? true : false,
      companyId
    );

    const certified = await this.getCertifiedProgrammes(
      stat.statFilter,
      abilityCondition,
      lastTimeForWhere,
      statCache,
      companyId,
      [{ key: "certifierId", operation: ">", value: 0 }],
      frzAgg,
      "certifierId",
      companyRole,
      stat.statFilter?.timeGroup ? true : false
    );

    if (!stat.statFilter || stat.statFilter.timeGroup != true) {
      return {
        last: Math.max(allAuth.all["authTime"], certified.last, revoked.last),
        data: {
          certifiedSum: Number(
            certified && certified.data.length > 0 && certified?.data[0]
              ? certified?.data[0]["totalestcredit"]
              : 0
          ),
          revokedSum: Number(
            revoked && revoked.data.length > 0 && revoked?.data[0]
              ? revoked.data[0]["totalestcredit"]
              : 0
          ),
          uncertifiedSum:
            Number(
              allAuth && allAuth.data.length > 0 && allAuth?.data[0]
                ? allAuth?.data[0]["sum"]
                : 0
            ) -
            Number(
              certified && certified?.data.length > 0 && certified?.data[0]
                ? certified?.data[0]["totalestcredit"]
                : 0
            ) -
            Number(
              revoked && revoked?.data.length > 0 && revoked?.data[0]
                ? revoked.data[0]["totalestcredit"]
                : 0
            ),
        },
      };
    } else {
      const groupedData = {};
      for (const d in certified.data) {
        groupedData[d] = {
          certifiedSum: Number(
            certified && certified.data[d] && certified.data[d].length > 0
              ? certified.data[d][0]["totalestcredit"]
              : 0
          ),
          revokedSum: 0,
        };
      }
      for (const d in revoked.data) {
        if (!groupedData[d]) {
          groupedData[d] = {
            revokedSum: Number(
              revoked && revoked.data[d] && revoked.data[d].length > 0
                ? revoked.data[d][0]["totalestcredit"]
                : 0
            ),
            certifiedSum: 0,
          };
        } else {
          groupedData[d]["revokedSum"] = Number(
            revoked && revoked.data[d] && revoked.data[d].length > 0
              ? revoked.data[d][0]["totalestcredit"]
              : 0
          );
        }
      }
      for (const d in allAuth.data) {
        if (!groupedData[d]) {
          groupedData[d] = {
            revokedSum: 0,
            certifiedSum: 0,
            uncertifiedSum: Number(
              allAuth && allAuth.data[d] && allAuth.data[d].length > 0
                ? allAuth.data[d][0]["sum"]
                : 0
            ),
          };
        } else {
          groupedData[d]["uncertifiedSum"] =
            Number(
              allAuth && allAuth.data[d] && allAuth.data[d].length > 0
                ? allAuth.data[d][0]["sum"]
                : 0
            ) -
            groupedData[d]["certifiedSum"] -
            groupedData[d]["revokedSum"];
        }
      }

      const timeLabel = Object.getOwnPropertyNames(groupedData);
      timeLabel.sort((a: any, b: any) => {
        let dateA: any = new Date(a);
        let dateB: any = new Date(b);
        return dateA - dateB;
      });

      const sortedGroupedData = {};
      timeLabel?.map((time) => {
        if (!sortedGroupedData[time]) {
          sortedGroupedData[time] = {
            certifiedSum: groupedData[time]["certifiedSum"],
            uncertifiedSum: groupedData[time]["uncertifiedSum"],
            revokedSum: groupedData[time]["revokedSum"],
          };
        } else {
          sortedGroupedData[time]["certifiedSum"] =
            groupedData[time]["certifiedSum"];
          sortedGroupedData[time]["uncertifiedSum"] =
            groupedData[time]["uncertifiedSum"];
          sortedGroupedData[time]["revokedSum"] =
            groupedData[time]["revokedSum"];
        }
      });

      const chartData = {
        timeLabel: [],
        certifiedSum: [],
        uncertifiedSum: [],
        revokedSum: [],
      };
      for (const tg in sortedGroupedData) {
        chartData.timeLabel.push(tg);
        chartData.certifiedSum.push(
          parseFloat(sortedGroupedData[tg]["certifiedSum"])
        );
        chartData.uncertifiedSum.push(
          parseFloat(sortedGroupedData[tg]["uncertifiedSum"])
        );
        chartData.revokedSum.push(
          parseFloat(sortedGroupedData[tg]["revokedSum"])
        );
      }

      return {
        last: Math.max(allAuth.all["authTime"], certified.last, revoked.last),
        data: chartData,
      };
    }
  }

  // async getMultipleStats(sourceStats: Stat[], newStat: Stat, results, frzAgg, abilityCondition, lastTimeForWhere, companyId, aggFunc: any) {
  //   for (const s of sourceStats) {
  //     if (!results[s.type]) {
  //       results = this.calcStat(s, results, frzAgg, abilityCondition, lastTimeForWhere, companyId);
  //     }
  //   }
  //   results[newStat.type] = aggFunc(results);
  // }

  async getAggregateQuery(
    abilityCondition: string,
    query: StatList,
    companyId: any,
    companyRole: CompanyRole
  ): Promise<DataCountResponseDto> {
    let results = {};
    let lastTimeForWhere = {};
    let statCache = {};

    for (const stat of query.stats) {
      await this.calcStat(
        stat,
        results,
        abilityCondition,
        lastTimeForWhere,
        statCache,
        companyId,
        companyRole
      );
    }
    return new DataCountResponseDto(results);
  }

  async getEmissions(
    stat,
    companyId,
    abilityCondition,
    lastTimeForWhere,
    statCache
  ) {

    console.log('get Emissions', stat, companyId)
    if (
      [
        StatType.MY_TOTAL_EMISSIONS
      ].includes(stat.type)
    ) {
      stat.statFilter
        ? (stat.statFilter.onlyMine = true)
        : (stat.statFilter = { onlyMine: true });
    }

    let filterAnd = this.getFilterAndByStatFilter(
      stat.statFilter,
      {
        value: companyId,
        key: "companyId",
        operation: "ANY",
      },
      "createdTime"
    );

    return await this.genAggregateTypeOrmQuery(
      this.programmeRepo,
      "programme",
      null,
      [
        {
          key: "emissionReductionExpected",
          operation: "SUM",
          fieldName: "totEmissionReductionExpected",
          mineCompanyId: stat?.statFilter?.onlyMine ? companyId : undefined,
        },
        {
          key: "emissionReductionAchieved",
          operation: "SUM",
          fieldName: "totEmissionReductionAchieved",
          mineCompanyId: stat?.statFilter?.onlyMine ? companyId : undefined,
        },
      ],
      filterAnd,
      null,
      stat.statFilter?.timeGroup ? { key: "time_group", order: "ASC" } : null,
      abilityCondition,
      lastTimeForWhere,
      statCache,
      ["createdTime"],
      stat.statFilter?.timeGroup ? "createdAt" : undefined,
      stat.statFilter?.timeGroup ? "day" : undefined
    );
  }


  async generateNDCAggregates(
    stat,
    abilityCondition,
    lastTimeForWhere,
    statCache,
    companyId
  ) {
    if (
      [
        StatType.MY_AGG_NDC_ACTION_BY_SECTOR,
        StatType.MY_AGG_NDC_ACTION_BY_TYPE
      ].includes(stat.type)
    ) {
      stat.statFilter
        ? (stat.statFilter.onlyMine = true)
        : (stat.statFilter = { onlyMine: true });
    }

    let filterAnd = this.getFilterAndByStatFilter(
      stat.statFilter,
      {
        value: companyId,
        key: "companyId",
        operation: "ANY",
      },
      "createdTime"
    );


    return await this.genAggregateTypeOrmQuery(
      this.ndcRepo,
      "ndcaction",
      [
        StatType.AGG_NDC_ACTION_BY_TYPE,
        StatType.MY_AGG_NDC_ACTION_BY_TYPE,
      ].includes(stat.type)
        ? ["action"]
        : ["sector"],
      [
        new AggrEntry("id", "COUNT", "count")
      ],
      filterAnd,
      null,
      stat.statFilter?.timeGroup ? { key: "time_group", order: "ASC" } : null,
      abilityCondition,
      lastTimeForWhere,
      statCache,
      [("createdTime"), "createdTime"],
      stat.statFilter?.timeGroup ? "createdAt" : undefined,
      stat.statFilter?.timeGroup ? "day" : undefined
    );
  }
  async generateProgrammeAggregates(
    stat,
    abilityCondition,
    lastTimeForWhere,
    statCache,
    companyId
  ) {
    if (
      [
        StatType.MY_AGG_PROGRAMME_BY_SECTOR,
      ].includes(stat.type)
    ) {
      stat.statFilter
        ? (stat.statFilter.onlyMine = true)
        : (stat.statFilter = { onlyMine: true });
    }

    let filterAnd = this.getFilterAndByStatFilter(
      stat.statFilter,
      {
        value: companyId,
        key: "companyId",
        operation: "ANY",
      },
      "createdTime"
    );


    return await this.genAggregateTypeOrmQuery(
      this.programmeRepo,
      "programme",
      ["sector"],
      [
        new AggrEntry("programmeId", "COUNT", "count"),
        {
          key: "creditEst",
          operation: "SUM",
          fieldName: "totalEstCredit",
          mineCompanyId: stat?.statFilter?.onlyMine ? companyId : undefined,
        },
        {
          key: "creditIssued",
          operation: "SUM",
          fieldName: "totalIssuedCredit",
          mineCompanyId: stat?.statFilter?.onlyMine ? companyId : undefined,
        },
      ],
      filterAnd,
      null,
      stat.statFilter?.timeGroup ? { key: "time_group", order: "ASC" } : null,
      abilityCondition,
      lastTimeForWhere,
      statCache,
      [("createdTime"), "createdTime"],
      stat.statFilter?.timeGroup ? "createdAt" : undefined,
      stat.statFilter?.timeGroup ? "day" : undefined
    );
  }

  private groupByStatus(key: string, data: any) {
    const mapping = {};
    for (const d of data) {
      if (!mapping[d[key]]) {
        mapping[d[key]] = [];
      }
      mapping[d[key]].push(d);
    }

    return data;
  }
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class Updatemitigationtimelinebygwpvalue1722232902408 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_mitigation_timeline(gwp_value INTEGER, mtg_unit TEXT)
            RETURNS VOID AS $$
            DECLARE
                batch_size INTEGER := 100;
                offset INTEGER := 0;
                record RECORD;
                new_timeline JSONB;
                temp_timeline JSONB;
                baseline_emissions_wm JSONB;
                activity_emissions_with_m JSONB;
                activity_emissions_with_am JSONB;
                expected_emission_reduct_with_m JSONB;
                expected_emission_reduct_with_am JSONB;
                baseline_actual_emissions JSONB;
                activity_actual_emissions JSONB;
                actual_emission_reduct JSONB;
                total_expected_emission_reduct_with_m NUMERIC;
                total_expected_emission_reduct_with_am NUMERIC;
                total_actual_emission_reduct NUMERIC;
            BEGIN
                LOOP
                    FOR record IN
                        SELECT "activityId", "mitigationTimeline"
                        FROM activity
                        WHERE "mitigationTimeline"->>'unit' = mtg_unit
                        ORDER BY "activityId"
                        LIMIT batch_size
                        OFFSET "offset"
                    LOOP
                        
                        baseline_emissions_wm := record."mitigationTimeline"->'expected'->'baselineEmissions';
                        activity_emissions_with_m := record."mitigationTimeline"->'expected'->'activityEmissionsWithM';
                        activity_emissions_with_am := record."mitigationTimeline"->'expected'->'activityEmissionsWithAM';

                        baseline_actual_emissions := record."mitigationTimeline"->'actual'->'baselineActualEmissions';
                        activity_actual_emissions := record."mitigationTimeline"->'actual'->'activityActualEmissions';

                        expected_emission_reduct_with_m := (
                            SELECT jsonb_agg(((baseline_value::numeric - activity_value::numeric) * gwp_value)::text::jsonb)
                            FROM jsonb_array_elements(baseline_emissions_wm) WITH ORDINALITY AS baseline_elements(baseline_value, idx)
                            JOIN jsonb_array_elements(activity_emissions_with_m) WITH ORDINALITY AS activity_elements(activity_value, idx2)
                            ON idx = idx2
                        );

                        expected_emission_reduct_with_am := (
                            SELECT jsonb_agg(((baseline_value::numeric - activity_value::numeric) * gwp_value)::text::jsonb)
                            FROM jsonb_array_elements(baseline_emissions_wm) WITH ORDINALITY AS baseline_elements(baseline_value, idx)
                            JOIN jsonb_array_elements(activity_emissions_with_am) WITH ORDINALITY AS activity_elements(activity_value, idx2)
                            ON idx = idx2
                        );

                        actual_emission_reduct := (
                            SELECT jsonb_agg(((baseline_value::numeric - activity_value::numeric) * gwp_value)::text::jsonb)
                            FROM jsonb_array_elements(baseline_actual_emissions) WITH ORDINALITY AS baseline_elements(baseline_value, idx)
                            JOIN jsonb_array_elements(activity_actual_emissions) WITH ORDINALITY AS activity_elements(activity_value, idx2)
                            ON idx = idx2
                        );
                        
                        -- Calculate total values

                        total_expected_emission_reduct_with_m := (
                            SELECT SUM((value->>0)::numeric)
                            FROM jsonb_array_elements(expected_emission_reduct_with_m) AS value
                        );

                        total_expected_emission_reduct_with_am := (
                            SELECT SUM((value->>0)::numeric)
                            FROM jsonb_array_elements(expected_emission_reduct_with_am) AS value
                        );

                        total_actual_emission_reduct := (
                            SELECT SUM((value->>0)::numeric)
                            FROM jsonb_array_elements(actual_emission_reduct) AS value
                        );
                        
                        -- Update 'expectedEmissionReductWithM' field

                        temp_timeline := jsonb_set(
                            record."mitigationTimeline",
                            '{expected,expectedEmissionReductWithM}'::text[],
                            expected_emission_reduct_with_m,
                            true
                        );

                        -- Update 'expectedEmissionReductWithAM' field

                        temp_timeline := jsonb_set(
                            temp_timeline,
                            '{expected,expectedEmissionReductWithAM}'::text[],
                            expected_emission_reduct_with_am,
                            true
                        );

                        -- Update 'actualEmissionReduct' field

                        temp_timeline := jsonb_set(
                            temp_timeline,
                            '{actual,actualEmissionReduct}'::text[],
                            actual_emission_reduct,
                            true
                        );
                        
                        -- Update total values

                        new_timeline := jsonb_set(
                            temp_timeline,
                            '{expected,total,expectedEmissionReductWithM}'::text[],
                            to_jsonb(total_expected_emission_reduct_with_m),
                            true
                        );

                        new_timeline := jsonb_set(
                            new_timeline,
                            '{expected,total,expectedEmissionReductWithAM}'::text[],
                            to_jsonb(total_expected_emission_reduct_with_am),
                            true
                        );

                        new_timeline := jsonb_set(
                            new_timeline,
                            '{actual,total,actualEmissionReduct}'::text[],
                            to_jsonb(total_actual_emission_reduct),
                            true
                        );

                        -- Update the row with the modified JSONB object

                        UPDATE activity
                        SET "mitigationTimeline" = new_timeline
                        WHERE "activityId" = record."activityId";

                    END LOOP;
                    EXIT WHEN NOT FOUND;
                    "offset" := "offset" + batch_size;
                END LOOP;
            END;
            $$ LANGUAGE plpgsql;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}

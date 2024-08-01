export class DataCountResponseDto {
  stats: any;
  lastUpdate: number;

  constructor(stats: any, lastUpdate: number) {
    this.stats = stats;
    this.lastUpdate = lastUpdate;
  }
}


export class DataListResponseDto {
    data: any[];
    total: number;

    constructor(data: any[], total: number) {
        this.total = total;
        this.data = data
    }
}

export class Utils {

    public static randomNumberBetween(min, max): number {
        return Math.random() * (max - min) + min;
    }



    public static random4(): string {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1) + '';
    }
}

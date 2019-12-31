
export class Metrics {

    x: number = 0;
    y: number = 0;
    height: number = 0;
    width: number = 0;
    rotation: number = 0;
    scaleX: number = 1;
    scaleY: number = 1;



    constructor(xArg: number,
                yArg: number,
                widthArg: number=20,
                heightArg: number=20,
                rotationArg: number=0,
                scaleXArg: number=1,
                scaleYArg: number=1) {
        this.x = xArg;
        this.y = yArg;
        this.width = widthArg;
        this.height = heightArg;
        this.rotation = rotationArg;
        this.scaleX = scaleXArg;
        this.scaleY = scaleYArg;
    }



    public static create(xArg: number=0,
                         yArg: number=0,
                         widthArg: number=20,
                         heightArg: number=20,
                         rotationArg: number=0,
                         scaleXArg: number=1,
                         scaleYArg: number=1): Metrics {
        return new Metrics(xArg, yArg, widthArg, heightArg, rotationArg, scaleXArg, scaleYArg);
    }



    public clone(): Metrics {
        return Metrics.create(
            this.x,
            this.y,
            this.width,
            this.height,
            this.rotation,
            this.scaleX,
            this.scaleY
        );
    }



    public toJSON(): Object {
        const json: Object = {
            'jsonClass': 'Metrics',
            'x': this.x,
            'y': this.y,
            'width': this.width,
            'height': this.height,
            'rotation': this.rotation,
            'scaleX': this.scaleX,
            'scaleY': this.scaleY
        };
        return json;
    }



    public static fromJSON(json: any): Metrics {
        return Metrics.create(
            json.x,
            json.y,
            json.width,
            json.height,
            json.rotation,
            json.scaleX,
            json.scaleY
        );
    }
}

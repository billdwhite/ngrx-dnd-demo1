import {Metrics} from './metrics';
import {ColorUtils} from '../utils';

export class Shape {

    public id: string;
    public label: string; 
    public metrics: Metrics;
    public backgroundColor: string = ColorUtils.randomHexColor();
    public foregroundColor: string = "#000000";


    public constructor() {
    }



    public static create(idArg: string, 
                         labelArg: string, 
                         metricsArg: Metrics, 
                         backgroundColorArg: string=ColorUtils.randomHexColor(), 
                         foregroundColorArg: string='#000000'): Shape {
        let returnShape: Shape = new Shape();
        returnShape.id = idArg;
        returnShape.label = labelArg;
        returnShape.metrics = metricsArg;
        returnShape.backgroundColor = backgroundColorArg;
        returnShape.foregroundColor = foregroundColorArg;
        return returnShape;
    }



    public clone(): Shape {
        return Shape.create(this.id, this.label, this.metrics.clone(), this.backgroundColor, this.foregroundColor);
    }
}

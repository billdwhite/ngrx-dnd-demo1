import {Metrics} from './metrics';
import {ColorUtils} from '../utils';

export class Shape {

    public id: string;
    public label: string; 
    public metrics: Metrics;
    public backgroundColor: string = ColorUtils.randomHexColor();
    public foregroundColor: string = "#000000";


    public constructor(idArg: string, labelArg: string, metricsArg: Metrics, backgroundColorArg: string=ColorUtils.randomHexColor(), foregroundColorArg: string='#000000') {
        this.id = idArg;
        this.label = labelArg;
        this.metrics = metricsArg;
        this.backgroundColor = backgroundColorArg;
        this.foregroundColor = foregroundColorArg;
    }


    public clone(): Shape {
        return new Shape(this.id, this.label, this.metrics.clone(), this.backgroundColor, this.foregroundColor);
    }
}

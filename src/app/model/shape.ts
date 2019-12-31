import {Metrics} from './metrics';

export class Shape {

    public id: string;
    public label: string; 
    public metrics: Metrics;


    public constructor(idArg: string, labelArg: string, metricsArg: Metrics) {
        this.id = idArg;
        this.label = labelArg;
        this.metrics = metricsArg;
    }


    public clone(): Shape {
        return new Shape(this.id, this.label, this.metrics.clone());
    }
}

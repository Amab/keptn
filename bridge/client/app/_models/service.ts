import {Root} from './root';
import {Trace} from './trace';
import { Deployment } from './deployment';
import {EventTypes} from './event-types';

export class Service {
  serviceName: string;
  deployedImage: string;
  stage: string;
  allDeploymentsLoaded = false;
  deployments: Deployment[] = [];
  lastEventTypes: {[key: string]: {eventId: string, keptnContext: string, time: number}};

  roots: Root[] = [];
  openApprovals: Trace[] = [];

  get deploymentContext(): string {
    return this.lastEventTypes?.[EventTypes.DEPLOYMENT_FINISHED]?.keptnContext ?? this.evaluationContext;
  }

  get deploymentTime(): number {
    return this.lastEventTypes?.[EventTypes.DEPLOYMENT_FINISHED]?.time || this.lastEventTypes?.[EventTypes.EVALUATION_FINISHED]?.time;
  }

  get evaluationContext(): string {
    return this.lastEventTypes?.[EventTypes.EVALUATION_FINISHED]?.keptnContext;
  }

  getShortImageName(): string {
    return this.deployedImage?.split('/').pop();
  }

  getImageVersion(): string {
    return this.deployedImage?.split(':').pop();
  }

  getOpenApprovals(): Trace[] {
    return this.openApprovals || [];
  }

  getOpenProblems(): Trace[] {
    // show running remediation or last faulty remediation
    return this.roots?.filter((root, index) => root.isRemediation() && (!root.isFinished() || root.isFaulty() && index == 0)) || [];
  }

  getRecentSequence(): Root {
    return this.roots[0];
  }

  getRecentEvaluation(): Trace {
    return this.getRecentSequence()?.getEvaluation(this.stage);
  }

  public hasRemediations(): boolean {
    return this.deployments.some(d => d.stages.some(s => s.remediations.length !== 0));
  }

  static fromJSON(data: any) {
    return Object.assign(new this(), data);
  }
}

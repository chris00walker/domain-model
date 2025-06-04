import { DomainEvent } from '@shared/domain/events/DomainEvent';
import { UniqueEntityID } from '@shared/domain/base/UniqueEntityID';
import { PromotionalCampaign } from '../aggregates/PromotionalCampaign';

export class PromotionalCampaignCreated extends DomainEvent {
  public campaign: PromotionalCampaign;

  constructor(campaign: PromotionalCampaign) {
    super({
      aggregateId: campaign.id.toString()
    });
    this.campaign = campaign;
  }

  toPrimitives(): any {
    return {
      campaignId: this.campaign.id.toString(),
      name: this.campaign.name,
      type: this.campaign.type,
      status: this.campaign.status,
      startDate: this.campaign.startDate.toISOString(),
      endDate: this.campaign.endDate.toISOString()
    };
  }
}

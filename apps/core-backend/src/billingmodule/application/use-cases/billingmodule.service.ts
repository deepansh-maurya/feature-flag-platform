import { Inject, Injectable } from '@nestjs/common';
import { BillingmoduleRepo, BillingmoduleRepoToken } from '../ports/billingmodule.repo';

@Injectable()
export class BillingmoduleService {
  constructor(@Inject(BillingmoduleRepoToken) private readonly repo: BillingmoduleRepo) {}
}


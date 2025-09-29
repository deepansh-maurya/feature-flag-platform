import { Injectable } from '@nestjs/common';
import { AnalyticsmoduleRepo } from '../../application/ports/analyticsmodule.repo';
import PrismaService from 'src/infra/prisma/prisma.service';
import {
  GetFlagMetricsDto,
  GetOverviewDto,
  RecordEvaluationDto,
} from 'src/analyticsmodule/interface/dto/create-analyticsmodule.dto';

@Injectable()
export class PrismaAnalyticsmoduleRepo implements AnalyticsmoduleRepo {
  constructor(private readonly prisma: PrismaService) {}

  async recordEvaluation(dto: RecordEvaluationDto): Promise<void> {
    await this.prisma.flagEvaluation.create({ data: dto });
  }

  async getOverview(dto: GetOverviewDto) {
    // Total evaluations
    const total = await this.prisma.flagEvaluation.count({
      where: {
        envKey: dto.envKey,
        evaluatedAt: { gte: dto.from, lte: dto.to },
      },
    });

    // Enabled %
    const enabled = await this.prisma.flagEvaluation.count({
      where: {
        envKey: dto.envKey,
        enabled: true,
        evaluatedAt: { gte: dto.from, lte: dto.to },
      },
    });

    // Unique users
    const uniqueUsers = await this.prisma.flagEvaluation.groupBy({
      by: ['userId'],
      where: {
        envKey: dto.envKey,
        evaluatedAt: { gte: dto.from, lte: dto.to },
      },
    });

    // API requests ≈ evaluations (or separate APIRequest table if you track differently)
    const apiRequests = total;

    return {
      totalEvaluations: total,
      enabledPercentage: total > 0 ? (enabled / total) * 100 : 0,
      apiRequests,
      uniqueUsers: uniqueUsers.length,
    };
  }

  async getFlagMetrics(dto: GetFlagMetricsDto) {
    const evaluations = await this.prisma.flagEvaluation.findMany({
      where: {
        flagId: dto.flagId,
        envKey: dto.envKey,
        evaluatedAt: { gte: dto.from, lte: dto.to },
      },
    });

    const total = evaluations.length;
    const enabled = evaluations.filter((e) => e.enabled).length;
    const disabled = total - enabled;

    // Unique users
    const uniqueUsers = new Set(evaluations.map((e) => e.userId)).size;

    // // Variant distribution
    // const variantDistribution: Record<string, number> = {};
    // evaluations.forEach((e) => {
    //   if (e.variant) {
    //     variantDistribution[e.variant] =
    //       (variantDistribution[e.variant] ?? 0) + 1;
    //   }
    // });

    // Top rules matched
    const topRules: Record<string, number> = {};
    evaluations.forEach((e) => {
      if (e.ruleMatched) {
        topRules[e.ruleMatched] = (topRules[e.ruleMatched] ?? 0) + 1;
      }
    });

    // Trend → group by day
    const trendMap: Record<string, { enabled: number; disabled: number }> = {};
    evaluations.forEach((e) => {
      const day = e.evaluatedAt.toISOString().split('T')[0];
      if (!trendMap[day]) trendMap[day] = { enabled: 0, disabled: 0 };
      if (e.enabled) trendMap[day].enabled++;
      else trendMap[day].disabled++;
    });
    const trend = Object.entries(trendMap).map(([date, counts]) => ({
      date,
      ...counts,
    }));

    return {
      evaluations: total,
      enabledPercentage: total > 0 ? (enabled / total) * 100 : 0,
      apiRequests: total,
      uniqueUsers,
      // variantDistribution,
      topRulesMatched: topRules,
      trend,
    };
  }
}

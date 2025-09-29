import { ApiProperty } from '@nestjs/swagger';

export class RuleCondition {
  @ApiProperty({
    description: 'The field to apply the condition on',
    example: 'age',
  })
  field: string;

  @ApiProperty({
    description: 'The operator to use in the condition',
    example: 'greaterThan',
    enum: [
      'equals',
      'notEquals',
      'greaterThan',
      'lessThan',
      'contains',
      'notContains',
    ],
  })
  operator: string;

  @ApiProperty({
    description: 'The value to compare against',
    example: 21,
  })
  value: any;
}

export class InterpretedRuleDto {
  @ApiProperty({
    description: 'List of conditions that make up the rule',
    type: [RuleCondition],
  })
  conditions: RuleCondition[];

  @ApiProperty({
    description: 'How to combine the conditions',
    example: 'and',
    enum: ['and', 'or'],
  })
  combinator: 'and' | 'or';
}

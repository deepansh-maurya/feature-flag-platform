import { IsString, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InterpretRuleDto {
  @ApiProperty({
    description: 'The natural language rule to interpret',
    example: 'Show the feature to users from the US with age greater than 21',
  })
  @IsString()
  @IsNotEmpty()
  naturalLanguageRule: string;

  @ApiProperty({
    description: 'Available fields that can be used in the rule',
    example: ['country', 'age', 'userType'],
    type: [String],
  })
  @IsArray()
  @IsNotEmpty()
  availableFields: string[];
}
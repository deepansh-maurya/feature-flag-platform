import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FlagsService } from './flags.service';

@Controller('flags')
export class FlagsController {

    constructor(private readonly flagService: FlagsService) { }


    @Get()
    getAllFlags() {
        return this.flagService.getAll()
    }

    @Post()
    createFlag(@Body() dto: { name: string, enabled: boolean }) {
        return this.flagService.create(dto)
    }

    @Get(':id')
    getFlag(@Param('id') id: string) {
        return this.flagService.getById(id)
    }

}

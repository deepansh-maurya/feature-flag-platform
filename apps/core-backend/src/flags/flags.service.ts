import { Injectable } from '@nestjs/common';

@Injectable()
export class FlagsService {

    private flags = [{ id: '1', name: "darkmode", enabled: true }]


    getAll() {
        return this.flags
    }

    getById(id: string) {
        return this.flags.find(f => f.id == id)
    }

    create(dto: { name: string; enabled: boolean }) {

    }

}
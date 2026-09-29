import { describe, beforeEach, jest, it, expect } from "@jest/globals";
import { Test } from "@nestjs/testing";
import { ShipmentsService } from "./shipments.service";
import { ShipmentEntity } from "./entities/shipment.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ShipmentRulesService } from "./shipment-rules.service";


describe("ShipmentServiceTest",()=>{
    let service : ShipmentsService

    const repositoryMock = {
        find: jest.fn(),
        findOneBy: jest.fn(),
        create: jest.fn(),
        save: jest.fn()
    }

    const shipmentRulesServiceMock = {
        ensureCanBeDispatched: jest.fn()
    }

    beforeEach( async()=>{
        jest.clearAllMocks()

        const moduleRef = await Test.createTestingModule({
            providers: [
                ShipmentsService,
                {
                    provide: getRepositoryToken(ShipmentEntity),
                    useValue: repositoryMock                  
                },
                {
                    provide: ShipmentRulesService,
                    useValue: shipmentRulesServiceMock
                }
            ]
        }).compile()

        service = moduleRef.get(ShipmentsService)
    })

    it('is defined', ()=>{
        //Arrange
        //Act
        //Assert
        expect(service).toBeDefined()

    })

})


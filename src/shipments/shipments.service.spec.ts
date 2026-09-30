import { describe, beforeEach, jest, it, expect } from "@jest/globals";
import { Test } from "@nestjs/testing";
import { ShipmentsService } from "./shipments.service";
import { ShipmentEntity } from "./entities/shipment.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ShipmentRulesService } from "./shipment-rules.service";
import { NotFoundException } from "@nestjs/common";
import { ShipmentStatus } from "./shipment-status.enum";
import { stat } from "fs";


    describe("ShipmentServiceTest",()=>{
        let service : ShipmentsService

        const repositoryMock = {
            find: jest.fn<any>(),
            findOneBy: jest.fn<any>(),
            create: jest.fn<any>(),
            save: jest.fn<any>()
        }

        const shipmentRulesServiceMock = {
            ensureCanBeDispatched: jest.fn<any>()
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

        it('returns all shipments', async ()=>{
            //Arrange-Preparacion
            const shipmentMock = [
                {
                id: 1,
                trackingCode: "abc",    
                destination: "cali",
                status: "created"
                },
                {
                id: 2,
                trackingCode: "abd",    
                destination: "medellin",
                status: "delivered"
                }
            ] as ShipmentEntity[]

            repositoryMock.find.mockResolvedValue(shipmentMock)

            //Act-Accion
            const result = await service.findAll()

            //Assert-Resultado esperado
            expect(result).toEqual(shipmentMock)
        })

        it('returns a shipment when the id exists', async ()=>{
            //Arrange-Preparacion
            const shipmentMock = {
                id: 7
            } as ShipmentEntity

            repositoryMock.findOneBy.mockResolvedValue(shipmentMock)
            //Act-Accion
            const result = await service.findOne(7)

            //Assert-Resultado esperado            
            expect(result).toEqual(shipmentMock)
            expect(repositoryMock.findOneBy).toHaveBeenCalledWith({id: 7})
        })

        it('throws NotFoundException when the id does not exist',async ()=>{
            //Arrange
            repositoryMock.findOneBy.mockResolvedValue(null)

            //Act            
            //Assert
            await expect(service.findOne(999)).rejects.toThrow(NotFoundException)
            expect(repositoryMock.findOneBy).toHaveBeenCalledWith({id: 999})
        })

        it('creates and saves a shipment',async ()=>{
            //Arrange
            const data = {
                trackingCode: 'SHIP-100',
                destination: 'Cali',
            }

            const createShipment = {
                ...data,
                status: ShipmentStatus.CREATED
            }

            const saveShipment = {
                id: 1,
                ...createShipment,
            } as ShipmentEntity

            repositoryMock.create.mockReturnValue(createShipment)
            repositoryMock.save.mockResolvedValue(saveShipment)

            //Act
            const result = await service.create(data)

            //Assert
            expect(repositoryMock.create).toHaveBeenCalledWith({
                trackingCode: 'SHIP-100',
                destination: 'Cali',
                status: ShipmentStatus.CREATED
            })
            expect(repositoryMock.save).toHaveBeenCalledWith(createShipment)
            expect(result).toEqual(saveShipment)

        })        

        it('dispatches and saves a valid shipment', async()=>{
            //Arrange
            const shipmentMock = 
                {
                id: 1,
                trackingCode: "abc",    
                destination: "cali",
                status: ShipmentStatus.CREATED
                } as ShipmentEntity

            const dispatchedShipment = {
                ...shipmentMock,
                status: ShipmentStatus.DISPATCHED
            } as ShipmentEntity

            repositoryMock.findOneBy.mockResolvedValue(shipmentMock)
            repositoryMock.save.mockResolvedValue(dispatchedShipment)

            //Action
            const result = await service.dispatch(1)


            //Assert
            expect(shipmentRulesServiceMock.ensureCanBeDispatched).toHaveBeenCalledWith(shipmentMock)
            expect(repositoryMock.save).toHaveBeenCalledWith(dispatchedShipment)
            expect(result).toEqual(dispatchedShipment)
    
        })

    })


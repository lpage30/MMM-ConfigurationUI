import { TestBed } from '@angular/core/testing';
import mock from 'mock-fs'
import { Config, ConfigfileService, Module } from './configfile.service';

describe('ConfigfileService', () => {
  const testModule1: Module = {
    module: 'test1',
    position: 'down',
    config: {
      anotherA: 'a',
    },
  }
  const testModule2: Module = {
    module: 'test2',
    position: 'down',
    config: {
      anotherB: 'b',
    },
  }
  const testConfig: Config = {
    a: 'b',
    c: 'd',
    modules: [testModule1, testModule2],
  } 
  beforeEach(() => {
    mock({
      [__dirname]: {
        '../../../..': {
          'config': {
            'config.js': `line1
            line2 a b c
            line3 e f g
            var config = {
              a: 'b',
              c: 'd',
              modules: [{
                module: 'test1',
                position: 'down',
                config {
                  anotherA: 'a',
                },
              },
              {
                module: 'test2',
                position: 'down',
                cofig: {
                  anotherB: 'b',
                },
              }]
            };
            line 4
            line 5 a b c
            `,
          },
        },
      },
    })
    TestBed.configureTestingModule({})
  })
  afterEach(() => mock.restore())

  it('should be created', () => {
    const service: ConfigfileService = TestBed.get(ConfigfileService);
    expect(service).toBeTruthy();
  });
  it('should load configuration and present modules', async () => {
    const service: ConfigfileService = TestBed.get(ConfigfileService);
    const config = await service.getModules()
    expect(config).toEqual(testConfig);
  });
});

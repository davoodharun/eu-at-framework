export interface OpcoConfig {
  name: string;
  domain: string;
  stageUrl: string;
  prodUrl: string;
}

export interface EnvironmentConfig {
  stage: OpcoConfig[];
  production: OpcoConfig[];
}

export const ENVIRONMENTS: EnvironmentConfig = {
  stage: [
    {
      name: 'bge',
      domain: 'bge.com',
      stageUrl: 'https://azstage.bge.com',
      prodUrl: 'https://bge.com'
    },
    {
      name: 'comed',
      domain: 'comed.com',
      stageUrl: 'https://azstage.comed.com',
      prodUrl: 'https://comed.com'
    },
    {
      name: 'peco',
      domain: 'peco.com',
      stageUrl: 'https://azstage.peco.com',
      prodUrl: 'https://peco.com'
    },
    {
      name: 'atlanticcityelectric',
      domain: 'atlanticcityelectric.com',
      stageUrl: 'https://azstage.atlanticcityelectric.com',
      prodUrl: 'https://atlanticcityelectric.com'
    },
    {
      name: 'delmarva',
      domain: 'delmarva.com',
      stageUrl: 'https://azstage.delmarva.com',
      prodUrl: 'https://delmarva.com'
    },
    {
      name: 'pepco',
      domain: 'pepco.com',
      stageUrl: 'https://azstage.pepco.com',
      prodUrl: 'https://pepco.com'
    }
  ],
  production: [
    {
      name: 'bge',
      domain: 'bge.com',
      stageUrl: 'https://azstage.bge.com',
      prodUrl: 'https://bge.com'
    },
    {
      name: 'comed',
      domain: 'comed.com',
      stageUrl: 'https://azstage.comed.com',
      prodUrl: 'https://comed.com'
    },
    {
      name: 'peco',
      domain: 'peco.com',
      stageUrl: 'https://azstage.peco.com',
      prodUrl: 'https://peco.com'
    },
    {
      name: 'atlanticcityelectric',
      domain: 'atlanticcityelectric.com',
      stageUrl: 'https://azstage.atlanticcityelectric.com',
      prodUrl: 'https://atlanticcityelectric.com'
    },
    {
      name: 'delmarva',
      domain: 'delmarva.com',
      stageUrl: 'https://azstage.delmarva.com',
      prodUrl: 'https://delmarva.com'
    },
    {
      name: 'pepco',
      domain: 'pepco.com',
      stageUrl: 'https://azstage.pepco.com',
      prodUrl: 'https://pepco.com'
    }
  ]
};

export function getOpcoConfig(opcoName: string, environment: 'stage' | 'production'): OpcoConfig | undefined {
  return ENVIRONMENTS[environment].find(opco => opco.name === opcoName);
}

export function getAllOpcos(environment: 'stage' | 'production'): OpcoConfig[] {
  return ENVIRONMENTS[environment];
}

export function getOpcoUrl(opcoName: string, environment: 'stage' | 'production'): string | undefined {
  const opco = getOpcoConfig(opcoName, environment);
  return opco ? (environment === 'stage' ? opco.stageUrl : opco.prodUrl) : undefined;
} 
export interface OpcoConfig {
  name: string;
  domain: string;
  anonUrl: string;
  secureUrl: string;
}

export interface UrlConfig {
  domain?: string;
  anonUrl: string;
  secureUrl: string;
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
      anonUrl: 'https://azstage.bge.com',
      secureUrl: 'https://s-secure.bge.com'
    },
    {
      name: 'com',
      domain: 'comed.com',
      anonUrl: 'https://azstage.comed.com',
      secureUrl: 'https://s-secure.comed.com'
    },
    {
      name: 'pec',
      domain: 'peco.com',
      anonUrl: 'https://azstage.peco.com',
      secureUrl: 'https://s-secure.peco.com'     
    },
    {
      name: 'ace',
      domain: 'atlanticcityelectric.com',
      anonUrl: 'https://azstage.atlanticcityelectric.com',
      secureUrl: 'https://s-secure.atlanticcityelectric.com', 
    },
    {
      name: 'dpl',
      domain: 'delmarva.com',
      anonUrl: 'https://azstage.delmarva.com',
      secureUrl: 'https://s-secure.delmarva.com',
    },
    {
      name: 'pep',
      domain: 'pepco.com',
      anonUrl: 'https://azstage.pepco.com',
      secureUrl: 'https://s-secure.pepco.com',
    }
  ],
  production: [
    {
      name: 'bge',
      domain: 'bge.com',
      anonUrl: 'https://bge.com',
      secureUrl: 'https://secure.bge.com'
    },
    {
      name: 'com',
      domain: 'comed.com',
      anonUrl: 'https://comed.com',
      secureUrl: 'https://secure.comed.com'
    },
    {
      name: 'pec',
      domain: 'peco.com',
      anonUrl: 'https://peco.com',
      secureUrl: 'https://secure.peco.com'
    },
    {
      name: 'ace',
      domain: 'atlanticcityelectric.com',
      anonUrl: 'https://atlanticcityelectric.com',
      secureUrl: 'https://secure.atlanticcityelectric.com'
    },
    {
      name: 'dpl',
      domain: 'delmarva.com',
      anonUrl: 'https://delmarva.com',
      secureUrl: 'https://secure.delmarva.com'
    },
    {
      name: 'pep',
      domain: 'pepco.com',
      anonUrl: 'https://pepco.com',
      secureUrl: 'https://secure.pepco.com'
    }
  ]
};

export function getOpcoConfig(opcoName: string, environment: 'stage' | 'production'): OpcoConfig | undefined {
  return ENVIRONMENTS[environment].find(opco => opco.name === opcoName);
}

export function getAllOpcos(environment: 'stage' | 'production'): OpcoConfig[] {
  return ENVIRONMENTS[environment];
}

export function getOpcoUrls(opcoName: string, environment: 'stage' | 'production'): UrlConfig | undefined {
  const opco = getOpcoConfig(opcoName, environment);
  return opco ? { anonUrl: opco.anonUrl, secureUrl: opco.secureUrl } : undefined;
}
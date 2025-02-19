import { describe, test, expect, vi } from 'vitest';
import { validateInputs, getProjectConfig, runSpectralAnalysis } from '../action.js';
import { ActionInputs, Project } from '../types.js';
import { Spectral } from '@stoplight/spectral-core';

describe('validateInputs', () => {
  test('should throw error for missing inputs in prod', async () => {
    const inputs: ActionInputs = {
      'github-token': undefined,
      'file-glob': 'test.yaml',
    };
    
    await expect(validateInputs(inputs))
      .rejects
      .toThrow('Missing required inputs');
  });

  test('should not throw error for missing inputs in dev', async () => {
    const inputs: ActionInputs = {
      'github-token': undefined,
      'file-glob': 'test.yaml',
    };
    
    await expect(validateInputs(inputs))
      .resolves
      .not.toThrow();
  });
});

describe('getProjectConfig', () => {
  test('should return project config with default workspace', () => {
    const config = getProjectConfig('/test/workspace');
    expect(config.workspace).toBe('/test/workspace');
  });
});

describe('runSpectralAnalysis', () => {
  test('should analyze files with appropriate spectral instance', async () => {
    const mockSpectral = {
      runWithResolved: vi.fn().mockResolvedValue({ results: [] }),
    };
    
    const fileContents = [
      { file: 'test/sailpoint-api.yaml', content: 'test' },
    ];
    
    const results = await runSpectralAnalysis(
      fileContents,
      {
        rootSpectral: mockSpectral as unknown as Spectral,
        pathSpectral: mockSpectral as unknown as Spectral,
        schemaSpectral: mockSpectral as unknown as Spectral,
      },
      '/test/workspace'
    );
    
    expect(results).toHaveLength(1);
    expect(mockSpectral.runWithResolved).toHaveBeenCalled();
  });
}); 
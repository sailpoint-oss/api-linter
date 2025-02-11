export const initProcessedPbs = () => {
  return {
    filteredPbs: {},
    severitiesCount: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
    },
  };
};

export const processPbs = (source: any, processedPbs: any, pbs: any) => {
  for (let i = 0; i < pbs.results.length; i++) {
    const pb = pbs.results[i];
    if (hasPb(source, processedPbs.filteredPbs, pb)) {
      continue;
    }
    processedPbs.severitiesCount[pb.severity]++;
    if (!processedPbs.filteredPbs[source]) {
      processedPbs.filteredPbs[source] = [];
    }
    processedPbs.filteredPbs[source].push(pb);
  }
  return processedPbs;
};

export const hasPb = (source: any, filteredPbs: any, pb: any) => {
  for (let i = 0; i < filteredPbs.length; i++) {
    if (
      source === filteredPbs[i].source &&
      pb.severity === filteredPbs[i].severity &&
      pb.code === filteredPbs[i].code &&
      pb.range.start.line === filteredPbs[i].range.start.line &&
      pb.range.start.character === filteredPbs[i].range.start.character &&
      pb.range.end.line === filteredPbs[i].range.end.line &&
      pb.range.end.character === filteredPbs[i].range.end.character
    ) {
      return true;
    }
  }
  return false;
};

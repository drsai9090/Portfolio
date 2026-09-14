export function resolveRoute(hash, projectIds, stageIds) {
  let path;
  try { path=decodeURIComponent(hash.replace(/^#/,'')); } catch { return {page:'not-found'}; }
  if(!path||path==='/'||path==='home')return {page:'home'};
  if(path==='/work')return {page:'projects'};
  if(['/projects','/about','/contact'].includes(path))return {page:path.slice(1)};
  const match=path.match(/^\/(stage|layer|district|project)\/([^/]+)$/);
  if(!match)return {page:'not-found'};
  if(match[1]==='project')return projectIds.includes(match[2])?{page:'project',id:match[2]}:{page:'not-found'};
  const id=match[1]==='stage'?match[2]:({api:'backend',delivery:'deploy'}[match[2]]||match[2]);
  return stageIds.includes(id)?{page:'stage',id}:{page:'not-found'};
}

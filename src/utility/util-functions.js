export const snapshotToArray = snapshot => Object.entries(snapshot).map(e => Object.assign(e[1], { id: e[0] }));

export const getNextId = () => String(1000000000 + Math.floor(Math.random() * 9000000000));

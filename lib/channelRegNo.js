const CHANNEL_REG_LOCK = 'channels_reg_no_lock';
const CHANNEL_REG_START_BASE = 999;

export async function withChannelRegNoLock(conn, handler, timeoutSeconds = 10) {
  const [[lockRow]] = await conn.query('SELECT GET_LOCK(?, ?) AS locked', [
    CHANNEL_REG_LOCK,
    timeoutSeconds,
  ]);

  if (lockRow?.locked !== 1) {
    throw new Error('Could not acquire channel registration number lock.');
  }

  try {
    return await handler();
  } finally {
    await conn.query('SELECT RELEASE_LOCK(?)', [CHANNEL_REG_LOCK]);
  }
}

export async function getNextChannelRegNo(conn) {
  const [[row]] = await conn.query('SELECT COALESCE(MAX(reg_no), ?) + 1 AS nextReg FROM channels', [
    CHANNEL_REG_START_BASE,
  ]);
  return Number(row?.nextReg) || CHANNEL_REG_START_BASE + 1;
}

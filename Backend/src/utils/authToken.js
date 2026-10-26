const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require("../Models/refreshToken.model");
const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_DAYS = "7";
const REFRESH_TOKEN_MS = REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000;

function getCookieOptions() {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.RENDER === "true" || Boolean(process.env.VERCEL);
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/"
  };
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createAccessToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      username: user.username
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

function createRefreshToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      type: "refresh"
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: `${REFRESH_TOKEN_DAYS}d` }
  )
}

async function issueAuthToken(user, res) {
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_MS);
  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashToken(refreshToken),
  });
  const cookieOptions = getCookieOption();
  res.cookie("token", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000
  });
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: REFRSH_TOKEN_MS
  });
  return { accessToken, refreshToken };
}

function clearAuthCookies(res) {
  const options = getCookieOptions();
  res.clearCookie("token", options);
  res.clearCookie("refrshToken", options);
}

module.exports = {
  issueAuthToken,
  createAccessToken,
  createRefreshToken,
  hashToken,
  getCookieOptions,
  clearAuthCookies,
  REFRESH_TOKEN_MS
};
/**
 * The following code has been import and "typed" using code directly from the set-cookie-parser package
 * https://github.com/nfriedly/set-cookie-parser
 */

type SameSite = "lax" | "strict" | "none";

interface Cookie {
  name: string;
  value: string;
  expires?: Date;
  maxAge?: number;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: SameSite;
  [key: string]: unknown;
}

type SetCookieParserOptions = {
  decodeValues: boolean;
  map: boolean;
  silent: boolean;
}

const SAMESITE = {
  lax: 'lax',
  none: 'none',
  strict: 'strict',
} as const;

function isNonEmptyString(str: string) {
  return typeof str === "string" && !!str.trim();
}

function parseNameValuePair(nameValuePairStr: string) {
  // Parses name-value-pair according to rfc6265bis draft

  let name = "";
  let value: string;
  let nameValueArr = nameValuePairStr.split("=");
  if (nameValueArr.length > 1) {
    name = nameValueArr.shift() ?? "";
    value = nameValueArr.join("="); // everything after the first =, joined by a "=" if there was more than one part
  } else {
    value = nameValuePairStr;
  }

  return { name, value };
}

export function parseCookie(setCookieValue: string, options: SetCookieParserOptions = { decodeValues: true, map: false, silent: false }) {
  const parts = setCookieValue.split(";").filter(isNonEmptyString);

  const nameValuePairStr = parts.shift() ?? "";
  const parsed = parseNameValuePair(nameValuePairStr);
  let name = parsed.name;
  let value = parsed.value;

  try {
    value = options.decodeValues ? decodeURIComponent(value) : value; // decode cookie value
  } catch (e) {
    console.error(
      "set-cookie-parser encountered an error while decoding a cookie with value '" +
        value +
        "'. Set options.decodeValues to false to disable this feature.",
      e
    );
  }

  const cookie: Cookie = { name, value };

  parts.forEach(function (part: string) {
    const sides = part.split("=");
    const key = sides.shift()?.trimStart().toLowerCase() ?? "";
    var value = sides.join("=");

    if (key === "expires") {
      cookie.expires = new Date(value);
    } else if (key === "max-age") {
      cookie.maxAge = parseInt(value, 10);
    } else if (key === "secure") {
      cookie.secure = true;
    } else if (key === "httponly") {
      cookie.httpOnly = true;
    } else if (key === "samesite") {
      cookie.sameSite = SAMESITE[value as SameSite] ? value as SameSite : "lax";
    } else {
      cookie[key] = value;
    }
  });

  return cookie;
}

/*
  Set-Cookie header field-values are sometimes comma joined in one string. This splits them without choking on commas
  that are within a single set-cookie field-value, such as in the Expires portion.
  This is uncommon, but explicitly allowed - see https://tools.ietf.org/html/rfc2616#section-4.2
  Node.js does this for every header *except* set-cookie - see https://github.com/nodejs/node/blob/d5e363b77ebaf1caf67cd7528224b651c86815c1/lib/_http_incoming.js#L128
  React Native's fetch does this for *every* header, including set-cookie.
  Based on: https://github.com/google/j2objc/commit/16820fdbc8f76ca0c33472810ce0cb03d20efe25
  Credits to: https://github.com/tomball for original and https://github.com/chrusart for JavaScript implementation
*/
export function splitCookieHeader(setCookieHeader: string) {
  if (Array.isArray(setCookieHeader)) {
    return setCookieHeader;
  }
  if (typeof setCookieHeader !== "string") {
    return [];
  }

  const cookiesStrings = [];
  let position = 0;
  let start: number;
  let character: string;
  let lastComma: number;
  let nextStart: number;
  let cookiesSeparatorFound: boolean;

  function skipWhitespace(): boolean {
    while (position < setCookieHeader.length && /\s/.test(setCookieHeader.charAt(position))) {
      position += 1;
    }
    return position < setCookieHeader.length;
  }

  function notSpecialChar(): boolean {
    character = setCookieHeader.charAt(position);

    return character !== "=" && character !== ";" && character !== ",";
  }

  while (position < setCookieHeader.length) {
    start = position;
    cookiesSeparatorFound = false;

    while (skipWhitespace()) {
      character = setCookieHeader.charAt(position);
      if (character === ",") {
        // ',' is a cookie separator if we have later first '=', not ';' or ','
        lastComma = position;
        position += 1;

        skipWhitespace();
        nextStart = position;

        while (position < setCookieHeader.length && notSpecialChar()) {
          position += 1;
        }

        // currently special character
        if (position < setCookieHeader.length && setCookieHeader.charAt(position) === "=") {
          // we found cookies separator
          cookiesSeparatorFound = true;
          // pos is inside the next cookie, so back up and return it.
          position = nextStart;
          cookiesStrings.push(setCookieHeader.substring(start, lastComma));
          start = position;
        } else {
          // in param ',' or param separator ';',
          // we continue from that comma
          position = lastComma + 1;
        }
      } else {
        position += 1;
      }
    }

    if (!cookiesSeparatorFound || position >= setCookieHeader.length) {
      cookiesStrings.push(setCookieHeader.substring(start, setCookieHeader.length));
    }
  }

  return cookiesStrings;
}
<?xml version="1.0" encoding="UTF-8"?>
<!--
  A sitemap is XML for crawlers, but a human opening it deserves better than
  their browser's default rendering (Safari strips the tags; Firefox prints a
  "no style information" banner). This is presentation only — crawlers ignore
  the xml-stylesheet instruction entirely, and browsers that have dropped XSLT
  simply fall back to the raw XML.
-->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="robots" content="noindex"/>
        <title>Sitemap — scajal.dev</title>
        <style>
          :root {
            color-scheme: light dark;
            --bg: #ffffff;
            --fg: #09090b;
            --muted: #71717a;
            --line: #e4e4e7;
            --accent: #3b5bdb;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #09090b;
              --fg: #fafafa;
              --muted: #a1a1aa;
              --line: #27272a;
              --accent: #91a7ff;
            }
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: clamp(2rem, 6vw, 4rem) clamp(1.25rem, 5vw, 3rem);
            background: var(--bg);
            color: var(--fg);
            font: 15px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
          }
          main { max-width: 68rem; margin: 0 auto; }
          .eyebrow {
            margin: 0;
            font: 500 0.75rem/1 ui-monospace, SFMono-Regular, Menlo, monospace;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--muted);
          }
          h1 { margin: 0.75rem 0 0; font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 600; letter-spacing: -0.02em; }
          .lede { margin: 0.75rem 0 0; max-width: 60ch; color: var(--muted); }
          .scroller { overflow-x: auto; margin-top: 2.5rem; }
          table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
          th {
            text-align: left;
            padding: 0 1rem 0.625rem 0;
            border-bottom: 1px solid var(--line);
            font: 500 0.6875rem/1 ui-monospace, SFMono-Regular, Menlo, monospace;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--muted);
            white-space: nowrap;
          }
          td { padding: 0.75rem 1rem 0.75rem 0; border-bottom: 1px solid var(--line); vertical-align: top; }
          td:last-child, th:last-child { padding-right: 0; }
          a { color: var(--accent); text-decoration-thickness: 1px; text-underline-offset: 2px; }
          .num, .alt { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--muted); white-space: nowrap; }
          .alt { font-size: 0.8125rem; }
          footer { margin-top: 2.5rem; font-size: 0.8125rem; color: var(--muted); }
        </style>
      </head>
      <body>
        <main>
          <p class="eyebrow">XML Sitemap</p>
          <h1>scajal.dev</h1>
          <p class="lede">
            <xsl:value-of select="count(sm:urlset/sm:url)"/>
            <xsl:text> URLs. This page is a stylesheet over the raw sitemap — </xsl:text>
            <xsl:text>crawlers read the XML underneath it.</xsl:text>
          </p>

          <div class="scroller">
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Languages</th>
                  <th>Last modified</th>
                  <th>Change freq.</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sm:urlset/sm:url">
                  <tr>
                    <td>
                      <a href="{sm:loc}"><xsl:value-of select="sm:loc"/></a>
                    </td>
                    <td class="alt">
                      <xsl:for-each select="xhtml:link[@rel='alternate']">
                        <xsl:if test="position() &gt; 1"><xsl:text>, </xsl:text></xsl:if>
                        <a href="{@href}"><xsl:value-of select="@hreflang"/></a>
                      </xsl:for-each>
                    </td>
                    <td class="num">
                      <xsl:choose>
                        <xsl:when test="sm:lastmod">
                          <xsl:value-of select="substring(sm:lastmod, 1, 10)"/>
                        </xsl:when>
                        <xsl:otherwise>—</xsl:otherwise>
                      </xsl:choose>
                    </td>
                    <td class="num"><xsl:value-of select="sm:changefreq"/></td>
                    <td class="num"><xsl:value-of select="sm:priority"/></td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>

          <footer>
            <a href="/">scajal.dev</a>
            <xsl:text> · </xsl:text>
            <a href="/robots.txt">robots.txt</a>
            <xsl:text> · </xsl:text>
            <a href="/llms.txt">llms.txt</a>
          </footer>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>

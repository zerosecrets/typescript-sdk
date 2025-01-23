import {refreshBitbucketTokens} from 'sdk/refresh-tokens/refresh-bitbucket-tokens'
import {refreshDiscordTokens} from 'sdk/refresh-tokens/refresh-discord-tokens'
import {refreshFigmaTokens} from 'sdk/refresh-tokens/refresh-figma-tokens'
import {refreshGithubTokens} from 'sdk/refresh-tokens/refresh-github-tokens'
import {refreshGitlabTokens} from 'sdk/refresh-tokens/refresh-gitlab-tokens'
import {refreshGoogleTokens} from 'sdk/refresh-tokens/refresh-google-tokens'
import {refreshLinkedInTokens} from 'sdk/refresh-tokens/refresh-linkedin-tokens'
import {refreshRedditTokens} from 'sdk/refresh-tokens/refresh-reddit-tokens'
import {refreshTwitterTokens} from 'sdk/refresh-tokens/refresh-twitter-tokens'
import {refreshZoomTokens} from 'sdk/refresh-tokens/refresh-zoom-tokens'
import {ResponseRefreshTokens, Vendor} from 'sdk/types'

export const refreshTokens: Record<
  Vendor,
  (params: {
    clientId: string
    clientSecret: string
    decryptedRefreshToken: string
  }) => Promise<ResponseRefreshTokens | null>
> = {
  [Vendor.BITBUCKET]: refreshBitbucketTokens,
  [Vendor.DISCORD]: refreshDiscordTokens,
  [Vendor.FIGMA]: refreshFigmaTokens,
  [Vendor.GITHUB]: refreshGithubTokens,
  [Vendor.GITLAB]: refreshGitlabTokens,
  [Vendor.GOOGLE]: refreshGoogleTokens,
  [Vendor.LINKEDIN]: refreshLinkedInTokens,
  [Vendor.REDDIT]: refreshRedditTokens,
  [Vendor.TWITTER]: refreshTwitterTokens,
  [Vendor.ZOOM]: refreshZoomTokens,
}

declare module 'google-trends-api' {
  interface InterestOverTimeOptions {
    keyword: string | string[]
    startTime?: Date
    endTime?: Date
    geo?: string | string[]
  }

  interface GoogleTrendsApi {
    interestOverTime(options: InterestOverTimeOptions): Promise<string>
  }

  const googleTrends: GoogleTrendsApi
  export default googleTrends
}

export interface InterviewDiscussion {
  title: string;
  url: string;
  snippet: string;
}

interface TavilyResult {
  title?: string;
  url?: string;
  content?: string;
}

interface TavilyResponse {
  results?: TavilyResult[];
}

export async function searchInterviewDiscussions(
  companyName: string,
): Promise<InterviewDiscussion[]> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!companyName.trim() || !apiKey) {
    return [];
  }

  const query = `"${companyName}" interview experience interview process interview questions`;

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "basic",
        max_results: 5,
        include_answer: false,
        include_raw_content: false,
      }),

      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.warn(`Interview discussion search failed: ${response.status}`);

      return [];
    }

    const data = (await response.json()) as TavilyResponse;

    return (data.results ?? [])
      .filter((result) => result.title && result.url && result.content)
      .map((result) => ({
        title: result.title!,
        url: result.url!,
        snippet: result.content!,
      }));
  } catch (error) {
    console.warn("Interview discussion search unavailable:", error);

    return [];
  }
}

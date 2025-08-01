### Next steps:

- User management (create account, ...)
- Store conversations per user
- Add paywall (top 100 companies free, must be premium user to access the rest)
- Manage document versioning
- Cron to check every n days (could start with 7) if there's an update in the documents (we do a sha 256 comparison between stored content and crawled content)
- Being able to start the whole workflow (crawling + summary + RAG) on a website never crawled before. The idea is to let premium users input any website and we do the search in real time for them.
- Being able to directly reference documents part that was used to generate the response
- Handle different regions legislations (EU vs US vs UK vs APAC)

## Notes
Might want to put FE and BE in a monorepo

### Ideas not prio
- Handle multiple languages

-------------------------------------------------------------------------------------------------

Goal of today: Give a better strucuture to the summary so that I can give a better display on the frontend

We needs a highlights sections. Like the top 5 facts, can be extended to 12

The goal of this code is to create a web crawler, a RESTful server, and a browser-based client that will allow a user to perform searches.
The server crawls through two set domains and retrieves information that's held in them and stores them in MongoDB. 
Since the domain is being crawled through, it creates a page rank value, that indicates how popular this site is. This is similar to how the Google search engine works.
The option to boost the results is available in case a user wants the closest search result ignoring popularity as the first factor.

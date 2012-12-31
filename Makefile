GITHUB_RUN_CMD = jekyll --pygments --no-lsi --safe --no-auto

test:
	$(GITHUB_RUN_CMD)

server:
	$(GITHUB_RUN_CMD) --server


# Universe

Repository fetcher.

Given an organsation, this project clones or pulls all of the repositories within it.

A UNIVERSE is considered a folder which contains all this organisations repositories, including this one.

## Prerequites

You must have a folder that is used for UNIVERSE only repositories.

For example:

```
~/blankbox/
```


This repo should then be child to that:

```
~/blankbox/universe/
```


All other respositories will be sibling or deeper to this repo.

You can then run the update command to fetch the master of any repos that you have access to.

Currently, just run:

```
node request.js
```

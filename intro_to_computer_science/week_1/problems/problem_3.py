"""
PROBLEM 3

Assume `s` is a string of lower case characters.

Write a program that prints the longest substring of `s` in which the letters
occur in alphabetical order. For example, if s = 'azcbobobegghakl', then your
program should print

```
Longest substring in alphabetical order is: beggh
```

In the case of ties, print the first substring. For example, if s = 'abcbcd',
then your program should print

```
Longest substring in alphabetical order is: abc
```
"""

s = 'azcbobobegghakl'
longest = s[0]
current = longest
for i in range(1, len(s)):
  if s[i] >= s[i - 1]:
    current += s[i]
  else:
    if len(current) > len(longest):
      longest = current
    current = s[i]
print(longest)

Week 1 (Exercise 2)
===================

Part 1
------

```python
>>> str1 = 'hello'
>>> str2 = ','
>>> str3 = 'world'

>>> str1
'hello'

>>> str1[0]
'h'

>>> str1[1]
'e'

>>> str1[-1]
'o'

>>> len(str1)
5

```

Part 2
------

```python
>>> str1 = 'hello'
>>> str2 = ','
>>> str3 = 'world'

>>> # str1[len(str1)]
>>> # Error (NoneType)

>>> str1 + str2 + str3
'hello,world'

>>> str1 + str2 + ' ' + str3
'hello, world'

>>> str3 * 3
'worldworldworld'

>>> 'hello' == str1
True

```

Part 3
------

```python
>>> str1 = 'hello'
>>> str2 = ','
>>> str3 = 'world'

>>> 'HELLO' == str1
False

>>> 'a' in str3
False

>>> str4 = str1 + str3
>>> 'low' in str4
True

>>> str3[1:3]
'or'

>>> str3[:3]
'wor'

```

Part 4
------

```python
>>> str1 = 'hello'
>>> str2 = ','
>>> str3 = 'world'
>>> str4 = str1 + str3

>>> str3[:-1]
'worl'

>>> str1[1:]
'ello'

>>> str4[1:9]
'elloworl'

>>> str4[1:9:2]
'elwr'

>>> str4[::-1]
'dlrowolleh'

```

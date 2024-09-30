Week 1 (Exercise 5)
===================

Question 1
----------

```python
>>> num = 10
>>> for num in range(5):
...    print(num)
0
1
2
3
4

>>> print(num)
4

```

Question 2
----------

```python
>>> divisor = 2
>>> for num in range(0, 10, 2):
...    print(num/divisor)
0.0
1.0
2.0
3.0
4.0

```

Question 3
----------

```python
>>> for variable in range(20):
...    if variable % 4 == 0:
...        print(variable)
...    if variable % 16 == 0:
...        print('Foo!')
0
Foo!
4
8
12
16
Foo!

```

Question 4
----------

```python
>>> for letter in 'hola':
...    print(letter)
h
o
l
a

```

Question 5
----------

```python
>>> count = 0
>>> for letter in 'Snow!':
...    print('Letter # ' + str(count) + ' is ' + str(letter))
...    count += 1
...    break
Letter # 0 is S

>>> print(count)
1

```

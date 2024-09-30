Week 1 (Exercise 4)
===================

Question 1:
-----------

```python
>>> num = 0
>>> while num <= 5:
...    print(num)
...    num += 1
0
1
2
3
4
5

>>> print("Outside of loop")
Outside of loop
>>> print(num)
6

```

Question 2:
-----------

```python
.. >>> numberOfLoops = 0
.. >>> numberOfApples = 2
.. >>> while numberOfLoops < 10:
.. ...    numberOfApples *= 2
.. ...    numberOfApples += numberOfLoops
.. ...    numberOfLoops -= 1

.. >>> print("Number of apples: " + str(numberOfApples))
.. infinite loop
```

Question 3:
-----------

```python
>>> num = 10
>>> while num > 3:
...    num -= 1
...    print(num)
9
8
7
6
5
4
3

```

Question 4:
-----------

```python
>>> num = 10
>>> while True:
...    if num < 7:
...        print('Breaking out of loop')
...        break
...    print(num)
...    num -= 1
10
9
8
7
Breaking out of loop

>>> print('Outside of loop')
Outside of loop

```

Question 5
----------

```python
.. >>> num = 10
.. >>> while not False:
.. ...    if num < 0:
.. ...        break
.. infinite loop

.. >>> print('num is: ' + str(num))
```

Week 1 (Exercise 6)
===================

Question 1
----------

```python
myStr = '6.00x'

for char in myStr:
    print(char)

print('done')
```

1. How many times does 6 print out?

   Answer
   -------
   Once

2. How many times does . print out?

   Answer
   ------
   Once


3. How many times does 0 print out?

   Answer
   ------
   Twice


4. How many times does x print out?

   Answer
   ------
   Once

5. How many times does done print out?

   Answer
   ------
   Once

Question 2
----------

```python
greeting = 'Hello!'
count = 0

for letter in greeting:
    count += 1
    if count % 2 == 0:
        print(letter)
    print(letter)

print('done')
```


1. How many times does H print out?

   Answer
   ------
   Once

2. How many times does e print out? Disregard the letters in the word done.

   Answer
   ------
   Twice

3. How many times does l print out?

   Answer
   -----
   Thrice

4. How many times does o print out? Disregard the letters in the word done.

   Answer
   ------
   Once

5. How many times does ! print out?

   Answer
   ------
   Twice

6. How many times does done print out?

   Answer
   ------
   Once

Question 3
----------

```python
school = 'Massachusetts Institute of Technology'
numVowels = 0
numCons = 0

for char in school:
    if char == 'a' or char == 'e' or char == 'i' \
       or char == 'o' or char == 'u':
        numVowels += 1
    elif char == 'o' or char == 'M':
        print(char)
    else:
        numCons -= 1

print('numVowels is: ' + str(numVowels))
print('numCons is: ' + str(numCons))
```

1. How many times does o print out? Disregard the o's in last two print
   statements.

   Answer
   ------
   Zero

2. How many times does M print out?

   Answer
   ------
   Once

3. What will the value of the variable numVowels be?

   Answer
   ------
   12

4. What will the value of the variable numCons be?

   Answer
   ------
   -25

"""
Week 1 (Exercise - for)
"""

# Question 1: Convert the following code into code that uses a for loop.
#
#             prints 2
#             prints 4
#             prints 6
#             prints 8
#             prints 10
#             prints "Goodbye!"

for n in range(2, 12, 2):
  print(n)
print('Goodbye!')

# Question 2: Convert the following code into code that uses a for loop.
#
#             prints "Hello!"
#             prints 10
#             prints 8
#             prints 6
#             prints 4
#             prints 2

print('Hello!')
for n in range(12, 0, -2):
  print(n)

# Question 3: Write a for loop that sums the values 1 through end, inclusive.
#             end is a variable that we define for you. So, for example, if we
#             define end to be 6, your code should print out the result:
#             ```
#             21
#             ```
#             which is 1 + 2 + 3 + 4 + 5 + 6.

sum = 0
end = 6
for num in range(end + 1):
  sum += num
print(sum)

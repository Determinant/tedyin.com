.. title: Code Syntax Highlight
.. slug: test-code-syntax
.. date: 2014/07/06 06:07:44
.. tags: 
.. link: 
.. category: coding
.. description: 
.. type: text

Test syntax highlight for Python:

.. code:: python
   :number-lines: 1

   def f(x):
       if (x < 10):
           print "Less than 10"
       else
           print "Greater than 10"
   f(10)
    
Test syntax highlight for C++:

.. code:: cpp
   :number-lines: 1

   class Num {
       public:
           enum {
               INT = 0,
               FLOAT = 1
           } type_level;
           /* Note that type_level of b must be the same as type_level of ``this''
            * */
           virtual Num *add(Num *b) = 0;
           virtual Num *sub(Num *b) = 0;
           virtual Num *mul(Num *b) = 0;
           virtual Num *div(Num *b) = 0;
           /* Convert b from a lower level type to higher level type */
           virtual Num *convert(Num *b) = 0;
           virtual void print() = 0;
           virtual ~Num() {}
   };

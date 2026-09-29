---
title: C++ Classes and OOP
url: https://en.cppreference.com/w/cpp/language/classes
---

# Classes and OOP

Classes combine data and member functions. Encapsulation, inheritance, and polymorphism are available but should be used deliberately.

## Class basics

```cpp
class Counter {
public:
    explicit Counter(int start = 0) : value_(start) {}
    void increment() { ++value_; }
    int value() const { return value_; }

private:
    int value_;
};
```

Constructors initialize state. Destructors release resources. Rule of Zero/Five: prefer types that manage resources via RAII members (`std::unique_ptr`, `std::string`) so you rarely write custom copy/move/destructor.

## Inheritance and virtuals

```cpp
class Shape {
public:
    virtual ~Shape() = default;
    virtual double area() const = 0;
};

class Circle : public Shape {
public:
    explicit Circle(double r) : radius_(r) {}
    double area() const override { return 3.14159 * radius_ * radius_; }

private:
    double radius_;
};
```

Always give polymorphic base classes a virtual destructor. Prefer `override` to catch signature mistakes.

## Access control

`public`, `protected`, and `private` control visibility. Favor composition over deep inheritance hierarchies for most application code.

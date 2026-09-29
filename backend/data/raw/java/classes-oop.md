---
title: Java Classes and OOP
url: https://docs.oracle.com/javase/tutorial/java/concepts/
---

# Classes and OOP

Java organizes behavior in classes and interfaces. Inheritance is single for classes; interfaces enable multiple contracts.

## Class example

```java
public class Account {
    private final String id;
    private double balance;

    public Account(String id, double balance) {
        this.id = id;
        this.balance = balance;
    }

    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("amount");
        balance += amount;
    }

    public double getBalance() {
        return balance;
    }
}
```

Fields are usually `private` with accessors. Mark immutable fields `final`.

## Interfaces and implementations

```java
public interface PaymentProcessor {
    void charge(double amount);
}

public class CardProcessor implements PaymentProcessor {
    @Override
    public void charge(double amount) {
        // process card
    }
}
```

Default and static methods on interfaces share reusable behavior without a base class.

## Records and sealed types

Java records provide compact immutable data carriers. Sealed classes restrict which types may extend a hierarchy, improving exhaustive pattern matching.

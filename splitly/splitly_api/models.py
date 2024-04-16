from django.db import models

class User(models.Model):
    username = models.CharField(max_length=100)
    display_name = models.CharField(max_length=100)

    def __str__(self):
        return self.display_name

class Group(models.Model):
    leader = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leader')
    userList = models.ManyToManyField(User, through='Transaction')
    totalCharge = models.FloatField(default=0)
    totalMembers = models.IntegerField(default=0)
    link = models.CharField(max_length=100)

    def __str__(self):
        return self.joinId

class Transaction(models.Model):
    payer = models.ForeignKey(User, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    totalOwed = models.FloatField()
    paid = models.BooleanField(default=False)
    cardNumber = models.IntegerField(null=True, blank=True)
    cardSecurity = models.IntegerField(null=True, blank=True)
    cardExpiration = models.CharField(max_length=7, null=True, blank=True)
    streetAddress = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=2, null=True, blank=True)
    zipCode = models.IntegerField(null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)

import graphene
from graphene_django import DjangoObjectType
from graphql import GraphQLError
from .models import User, Group, Transaction
from django.db.models import Q

class UserType(DjangoObjectType):
    class Meta:
        model = User

class GroupType(DjangoObjectType):
    class Meta:
        model = Group

class TransactionType(DjangoObjectType):
    class Meta:
        model = Transaction

class Query(graphene.ObjectType):
    class Arguments:
        id = graphene.ID()
        userId = graphene.ID()
        groupId = graphene.ID()

    users = graphene.List(UserType)
    user_by_id = graphene.Field(UserType, id=graphene.ID())
    groups = graphene.List(GroupType, userId=graphene.ID())
    group_by_id = graphene.Field(GroupType, id=graphene.ID())
    user_payments_for_group = graphene.List(TransactionType, groupId=graphene.ID())
    transactions = graphene.List(TransactionType, userId=graphene.ID(), groupId=graphene.ID())
    transaction_by_id = graphene.Field(TransactionType, userId=graphene.ID(), groupId=graphene.ID())

    def resolve_users(self, info, **kwargs):
        if 'id' in kwargs:
            return User.objects.get(pk=kwargs['id'])
        return User.objects.all()

    def resolve_user_by_id(self, info, id):
        return User.objects.get(pk=id)

    def resolve_groups(self, info, **kwargs):
        return Group.objects.all()

    def resolve_group_by_id(self, info, id):
        return Group.objects.get(pk=id)
      
    def resolve_user_payments_for_group(self, info, groupId):
        return Transaction.objects.filter(group__pk=groupId)

    def resolve_transactions(self, info, **kwargs):
        queryset = Transaction.objects.all()
        return queryset

    def resolve_transaction_by_id(self, info, userId, groupId):
        return Transaction.objects.get(payer__pk=userId, group__pk=groupId)

class CreateUser(graphene.Mutation):
    user = graphene.Field(UserType)

    class Arguments:
        username = graphene.String(required=True)
        display_name = graphene.String()

    def mutate(self, info, username, display_name):
        user = User(username=username, display_name=display_name)
        user.save()

        return CreateUser(
            user=user
        )

class CreateGroup(graphene.Mutation):
    group = graphene.Field(GroupType)

    class Arguments:
        leader = graphene.ID(required=True)
        userList = graphene.List(graphene.ID)
        totalCharge = graphene.Float()
        totalMembers = graphene.Int()
        link = graphene.String()

    def mutate(self, info, leader, userList, totalMembers, totalCharge=None):
        group = Group(
            leader=User.objects.get(pk=leader),
            totalCharge=totalCharge,
            totalMembers=totalMembers,
        )
        group.save()
        for user in userList:
            transaction = Transaction.objects.create(payer=User.objects.get(pk=user), 
                group=group, 
                totalOwed=totalCharge/float(totalMembers),
                paid=False)

        return CreateGroup(
            group=group
        )

class CreateTransaction(graphene.Mutation):
    transaction = graphene.Field(TransactionType)

    class Arguments:
        payer = graphene.ID(required=True)
        group = graphene.ID(required=True)
        totalOwed = graphene.Float(required=True)
        paid = graphene.Boolean()
        cardNumber = graphene.Int()
        cardSecurity = graphene.Int()
        cardExpiration = graphene.String()
        streetAddress = graphene.String()
        city = graphene.String()
        state = graphene.String()
        zipCode = graphene.Int()
        country = graphene.String()

    def mutate(self, info, payer, group, paid=False, cardNumber=None, cardSecurity=None, cardExpiration=None, streetAddress=None, city=None, state=None, zipCode=None, country=None):
        transaction = Transaction(
            payer=User.objects.get(pk=payer),
            group=Group.objects.get(pk=group),
            totalOwed=group.totalCharge/float(group.totalMembers),
            paid=paid,
            cardNumber=cardNumber,
            cardSecurity=cardSecurity,
            cardExpiration=cardExpiration,
            streetAddress=streetAddress,
            city=city,
            state=state,
            zipCode=zipCode,
            country=country
        )
        transaction.save()

        return CreateTransaction(
            transaction=transaction
        )

class DeleteUser(graphene.Mutation):
    ok = graphene.Boolean()

    class Arguments:
        id = graphene.ID(required=True)

    def mutate(self, info, id):
        user = User.objects.get(pk=id)
        user.delete()

        return DeleteUser(ok=True)

class DeleteGroup(graphene.Mutation):
    ok = graphene.Boolean()

    class Arguments:
        id = graphene.ID(required=True)

    def mutate(self, info, id):
        group = Group.objects.get(pk=id)
        group.delete()

        return DeleteGroup(ok=True)

class DeleteTransaction(graphene.Mutation):
    ok = graphene.Boolean()

    class Arguments:
        id = graphene.ID(required=True)

    def mutate(self, info, id):
        transaction = Transaction.objects.get(pk=id)
        transaction.delete()

        return DeleteTransaction(ok=True)

class DeleteUserTransactionForGroup(graphene.Mutation):
    ok = graphene.Boolean()

    class Arguments:
        userId = graphene.ID(required=True)
        groupId = graphene.ID(required=True)

    def mutate(self, info, userId, groupId):
        transaction = Transaction.objects.get(payer__pk=userId, group__pk=groupId)
        transaction.delete()

        return DeleteUserTransactionForGroup(ok=True)

class DeleteGroupTransactions(graphene.Mutation):
    ok = graphene.Boolean()

    class Arguments:
        groupId = graphene.ID(required=True)

    def mutate(self, info, groupId):
        transactions = Transaction.objects.all().filter(group__pk=groupId)
        transactions.delete()

        return DeleteGroupTransactions(ok=True)

class UpdateUser(graphene.Mutation):
    user = graphene.Field(UserType)

    class Arguments:
        id = graphene.ID(required=True)
        display_name = graphene.String()

    def mutate(self, info, id, display_name):
        user = User.objects.get(pk=id)
        user.display_name = display_name
        user.save()

        return UpdateUser(
            user=user
        )

class UpdateGroup(graphene.Mutation):
    group = graphene.Field(GroupType)

    class Arguments:
        id = graphene.ID(required=True)
        totalCharge = graphene.Float()
        totalMembers = graphene.Int()
        userList = graphene.List(graphene.ID)

    def mutate(self, info, id, totalCharge=None, totalMembers=None, userList=[]):
        group = Group.objects.get(pk=id)
        if totalCharge:
            group.totalCharge = totalCharge
        if totalMembers:
            group.totalMembers = totalMembers
        # Need to add transaction owed changes here (not for mvp)
        group.save()
        for user in userList:
            if Transaction.objects.all().filter(payer__pk=user, group__pk=id):
                continue
            if len(Transaction.objects.all().filter(group__pk=id)) >= group.totalMembers:
                raise GraphQLError('Group already full')
            Transaction.objects.create(
                payer=User.objects.get(pk=user),
                group=group,
                totalOwed=group.totalCharge/float(group.totalMembers),
            )
        group.save()

        return UpdateGroup(
            group=group
        )

class UpdateTransaction(graphene.Mutation):
    transaction = graphene.Field(TransactionType)

    class Arguments:
        userId = graphene.ID(required=True)
        groupId = graphene.ID(required=True)
        paid = graphene.Boolean()
        cardNumber = graphene.Int()
        cardSecurity = graphene.Int()
        cardExpiration = graphene.String()
        streetAddress = graphene.String()
        city = graphene.String()
        state = graphene.String()
        zipCode = graphene.Int()
        country = graphene.String()

    def mutate(self, info, userId, groupId, **kwargs):
        transaction = Transaction.objects.get(group__pk=groupId, payer__pk=userId)
        for key in kwargs:
            setattr(transaction, key, kwargs[key])
        transaction.save()

        return UpdateTransaction(
            transaction=transaction
        )

class Mutation(graphene.ObjectType):
    create_user = CreateUser.Field()
    create_group = CreateGroup.Field()
    create_transaction = CreateTransaction.Field()
    delete_user = DeleteUser.Field()
    delete_group = DeleteGroup.Field()
    delete_transaction = DeleteTransaction.Field()
    delete_group_transactions = DeleteGroupTransactions.Field()
    delete_user_transaction_for_group = DeleteUserTransactionForGroup.Field()
    update_user = UpdateUser.Field()
    update_group = UpdateGroup.Field()
    update_transaction = UpdateTransaction.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)

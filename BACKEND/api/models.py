from djongo import models  # Use djongo's models for MongoDB support like arrayfield

class Message(models.Model):
    role = models.CharField(max_length=10)
    content = models.TextField()
    recorded_on = models.JSONField()
    token_cost = models.JSONField(null=True, blank=True)

    class Meta:
        abstract = True # for some nested array


class ChatLog(models.Model):
    stime = models.JSONField()
    messages = models.ArrayField(model_container=Message)
    last_interact = models.JSONField()
    llm_deployment_name = models.CharField(max_length=100)
    llm_model_name = models.CharField(max_length=100)
    vectorstore_index = models.CharField(max_length=100)
    overall_cost = models.JSONField()
    person = models.CharField(max_length=50)

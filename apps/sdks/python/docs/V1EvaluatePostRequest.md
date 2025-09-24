# V1EvaluatePostRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**flag_key** | **str** |  | [optional] 
**env_key** | **str** |  | [optional] 
**context** | **Dict[str, object]** | Arbitrary targeting attributes | [optional] 

## Example

```python
from openapi_client.models.v1_evaluate_post_request import V1EvaluatePostRequest

# TODO update the JSON string below
json = "{}"
# create an instance of V1EvaluatePostRequest from a JSON string
v1_evaluate_post_request_instance = V1EvaluatePostRequest.from_json(json)
# print the JSON string representation of the object
print(V1EvaluatePostRequest.to_json())

# convert the object into a dict
v1_evaluate_post_request_dict = v1_evaluate_post_request_instance.to_dict()
# create an instance of V1EvaluatePostRequest from a dict
v1_evaluate_post_request_from_dict = V1EvaluatePostRequest.from_dict(v1_evaluate_post_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



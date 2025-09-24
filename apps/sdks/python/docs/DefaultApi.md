# openapi_client.DefaultApi

All URIs are relative to *https://sdk.yourdomain.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**v1_config_get**](DefaultApi.md#v1_config_get) | **GET** /v1/config | Fetch all flag configs for an environment
[**v1_evaluate_post**](DefaultApi.md#v1_evaluate_post) | **POST** /v1/evaluate | Evaluate a feature flag


# **v1_config_get**
> Dict[str, object] v1_config_get(env_key)

Fetch all flag configs for an environment

Returns the full config (raw JSON for now).

### Example

* Api Key Authentication (ApiKeyAuth):

```python
import openapi_client
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://sdk.yourdomain.com
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "https://sdk.yourdomain.com"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: ApiKeyAuth
configuration.api_key['ApiKeyAuth'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['ApiKeyAuth'] = 'Bearer'

# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.DefaultApi(api_client)
    env_key = 'env_key_example' # str | 

    try:
        # Fetch all flag configs for an environment
        api_response = api_instance.v1_config_get(env_key)
        print("The response of DefaultApi->v1_config_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling DefaultApi->v1_config_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **env_key** | **str**|  | 

### Return type

**Dict[str, object]**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Config response (raw JSON for now) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **v1_evaluate_post**
> Dict[str, object] v1_evaluate_post(v1_evaluate_post_request)

Evaluate a feature flag

Check if a flag is enabled and get its evaluation result.

### Example

* Api Key Authentication (ApiKeyAuth):

```python
import openapi_client
from openapi_client.models.v1_evaluate_post_request import V1EvaluatePostRequest
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://sdk.yourdomain.com
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "https://sdk.yourdomain.com"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: ApiKeyAuth
configuration.api_key['ApiKeyAuth'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['ApiKeyAuth'] = 'Bearer'

# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.DefaultApi(api_client)
    v1_evaluate_post_request = openapi_client.V1EvaluatePostRequest() # V1EvaluatePostRequest | 

    try:
        # Evaluate a feature flag
        api_response = api_instance.v1_evaluate_post(v1_evaluate_post_request)
        print("The response of DefaultApi->v1_evaluate_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling DefaultApi->v1_evaluate_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **v1_evaluate_post_request** | [**V1EvaluatePostRequest**](V1EvaluatePostRequest.md)|  | 

### Return type

**Dict[str, object]**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Evaluation result (raw JSON for now) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


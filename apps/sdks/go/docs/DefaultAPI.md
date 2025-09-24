# \DefaultAPI

All URIs are relative to *https://sdk.yourdomain.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**V1ConfigGet**](DefaultAPI.md#V1ConfigGet) | **Get** /v1/config | Fetch all flag configs for an environment
[**V1EvaluatePost**](DefaultAPI.md#V1EvaluatePost) | **Post** /v1/evaluate | Evaluate a feature flag



## V1ConfigGet

> map[string]interface{} V1ConfigGet(ctx).EnvKey(envKey).Execute()

Fetch all flag configs for an environment



### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	envKey := "envKey_example" // string | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.DefaultAPI.V1ConfigGet(context.Background()).EnvKey(envKey).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `DefaultAPI.V1ConfigGet``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `V1ConfigGet`: map[string]interface{}
	fmt.Fprintf(os.Stdout, "Response from `DefaultAPI.V1ConfigGet`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiV1ConfigGetRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **envKey** | **string** |  | 

### Return type

**map[string]interface{}**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## V1EvaluatePost

> map[string]interface{} V1EvaluatePost(ctx).V1EvaluatePostRequest(v1EvaluatePostRequest).Execute()

Evaluate a feature flag



### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	v1EvaluatePostRequest := *openapiclient.NewV1EvaluatePostRequest() // V1EvaluatePostRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.DefaultAPI.V1EvaluatePost(context.Background()).V1EvaluatePostRequest(v1EvaluatePostRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `DefaultAPI.V1EvaluatePost``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `V1EvaluatePost`: map[string]interface{}
	fmt.Fprintf(os.Stdout, "Response from `DefaultAPI.V1EvaluatePost`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiV1EvaluatePostRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **v1EvaluatePostRequest** | [**V1EvaluatePostRequest**](V1EvaluatePostRequest.md) |  | 

### Return type

**map[string]interface{}**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


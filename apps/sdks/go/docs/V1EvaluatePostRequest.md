# V1EvaluatePostRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**FlagKey** | Pointer to **string** |  | [optional] 
**EnvKey** | Pointer to **string** |  | [optional] 
**Context** | Pointer to **map[string]interface{}** | Arbitrary targeting attributes | [optional] 

## Methods

### NewV1EvaluatePostRequest

`func NewV1EvaluatePostRequest() *V1EvaluatePostRequest`

NewV1EvaluatePostRequest instantiates a new V1EvaluatePostRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewV1EvaluatePostRequestWithDefaults

`func NewV1EvaluatePostRequestWithDefaults() *V1EvaluatePostRequest`

NewV1EvaluatePostRequestWithDefaults instantiates a new V1EvaluatePostRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetFlagKey

`func (o *V1EvaluatePostRequest) GetFlagKey() string`

GetFlagKey returns the FlagKey field if non-nil, zero value otherwise.

### GetFlagKeyOk

`func (o *V1EvaluatePostRequest) GetFlagKeyOk() (*string, bool)`

GetFlagKeyOk returns a tuple with the FlagKey field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFlagKey

`func (o *V1EvaluatePostRequest) SetFlagKey(v string)`

SetFlagKey sets FlagKey field to given value.

### HasFlagKey

`func (o *V1EvaluatePostRequest) HasFlagKey() bool`

HasFlagKey returns a boolean if a field has been set.

### GetEnvKey

`func (o *V1EvaluatePostRequest) GetEnvKey() string`

GetEnvKey returns the EnvKey field if non-nil, zero value otherwise.

### GetEnvKeyOk

`func (o *V1EvaluatePostRequest) GetEnvKeyOk() (*string, bool)`

GetEnvKeyOk returns a tuple with the EnvKey field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEnvKey

`func (o *V1EvaluatePostRequest) SetEnvKey(v string)`

SetEnvKey sets EnvKey field to given value.

### HasEnvKey

`func (o *V1EvaluatePostRequest) HasEnvKey() bool`

HasEnvKey returns a boolean if a field has been set.

### GetContext

`func (o *V1EvaluatePostRequest) GetContext() map[string]interface{}`

GetContext returns the Context field if non-nil, zero value otherwise.

### GetContextOk

`func (o *V1EvaluatePostRequest) GetContextOk() (*map[string]interface{}, bool)`

GetContextOk returns a tuple with the Context field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetContext

`func (o *V1EvaluatePostRequest) SetContext(v map[string]interface{})`

SetContext sets Context field to given value.

### HasContext

`func (o *V1EvaluatePostRequest) HasContext() bool`

HasContext returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



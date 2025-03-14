import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Code, Loader2, PlayCircle } from "lucide-react";
import { callContractFunction } from '../services/api';
import { useForm } from "react-hook-form";

// Sample contract functions - replace with actual functions from your contract
const contractFunctions = [
  { 
    name: 'epoch', 
    description: 'Get the current epoch number',
    inputs: [] 
  },
  { 
    name: 'totalRewardPerEpoch', 
    description: 'Get the total reward per epoch',
    inputs: [] 
  },
  { 
    name: 'computeRewards', 
    description: 'Compute rewards for a pool and epoch',
    inputs: [
      { name: 'poolId', type: 'string', placeholder: 'Enter pool ID (address)' },
      { name: 'epoch', type: 'number', placeholder: 'Enter epoch number' }
    ] 
  },
  { 
    name: 'epochStartTime', 
    description: 'Get the start time of an epoch',
    inputs: [
      { name: 'epoch', type: 'number', placeholder: 'Enter epoch number' }
    ] 
  },
  { 
    name: 'epochEndTime', 
    description: 'Get the end time of an epoch',
    inputs: [
      { name: 'epoch', type: 'number', placeholder: 'Enter epoch number' }
    ] 
  }
];

export default function ContractFunctions() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [functionDetails, setFunctionDetails] = useState(null);
  
  // Initialize react-hook-form
  const form = useForm({
    defaultValues: {
      functionName: '',
      // Dynamic input values will be added later
    }
  });
  
  const selectedFunction = form.watch('functionName');

  // Update function details when selected function changes
  useEffect(() => {
    if (selectedFunction) {
      const details = contractFunctions.find(f => f.name === selectedFunction);
      setFunctionDetails(details);
      
      // Reset input values
      if (details && details.inputs) {
        const resetValues = {};
        details.inputs.forEach(input => {
          resetValues[input.name] = '';
        });
        
        // Reset the form with new values
        form.reset({
          functionName: selectedFunction,
          ...resetValues
        });
      }
      
      // Reset result and error
      setResult(null);
      setError(null);
    }
  }, [selectedFunction, form]);

  const onSubmit = async (data) => {
    if (!data.functionName) {
      setError('Please select a function');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare parameters
      const params = functionDetails.inputs.map(input => data[input.name]);
      
      // Call the function
      const response = await callContractFunction(data.functionName, params);
      
      if (response.success) {
        setResult(response.result);
      } else {
        setError(response.error || 'An error occurred while calling the function');
        setResult(null);
      }
    } catch (error) {
      setError(error.message || 'An error occurred while calling the function');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Format the result for display
  const formatResult = (result) => {
    if (result === null || result === undefined) {
      return 'null';
    }
    
    if (typeof result === 'object') {
      return JSON.stringify(result, null, 2);
    }
    
    return result.toString();
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Contract Functions</CardTitle>
          <CardDescription>
            Call read functions from the contract
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="functionName"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Function</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a function" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contractFunctions.map((func) => (
                          <SelectItem key={func.name} value={func.name}>
                            {func.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {functionDetails && (
                      <FormDescription>
                        {functionDetails.description}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {functionDetails && functionDetails.inputs.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Function Parameters</h3>
                  {functionDetails.inputs.map((input, index) => (
                    <FormField
                      key={index}
                      control={form.control}
                      name={input.name}
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>{input.name}</FormLabel>
                          <FormControl>
                            <Input
                              type={input.type === 'number' ? 'number' : 'text'}
                              placeholder={input.placeholder}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              )}
              
              <Button type="submit" disabled={isLoading || !selectedFunction}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calling...
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Call Function
                  </>
                )}
              </Button>
              
              {error && (
                <div className="text-destructive mt-2">{error}</div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {result !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription>
              Output from {selectedFunction}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md overflow-x-auto">
              <pre className="text-sm font-mono">
                {formatResult(result)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
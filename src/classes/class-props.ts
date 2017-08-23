import * as T from "babel-types";

export function copyComments<N extends T.Node>(node: T.Node, newNode: N): N {
  newNode.leadingComments = node.leadingComments;
  return newNode;
}

/**
 * Convert the given annotation (which might be `undefined`) into an appropriate Flow annotation.
 * @param typeAnnotation Type annotation pulled from AST.
 */
export function maybeTypeOrExistential(typeAnnotation: void | T.TypeAnnotation): T.FlowTypeAnnotation {
  if (typeAnnotation) return typeAnnotation.typeAnnotation;
  return T.existentialTypeParam() as any; // use `any` to work around error in typedef
}

export function convertFunctionParamToFunctionTypeParam(
  ident: T.Identifier
): T.FunctionTypeParam {
  const id = T.identifier(ident.name);
  const type = maybeTypeOrExistential(ident.typeAnnotation);
  return T.functionTypeParam(id, type);
}

/**
 * Generate a type property representation of the given class property.
 * @param classProp `ClassProperty` node
 */
export function convertClassPropertyToPropertyAnnot(
  classProp: T.ClassProperty
): T.ObjectTypeProperty {
  const key = classProp.key;
  const declaredType: T.FlowTypeAnnotation = maybeTypeOrExistential(
    classProp.typeAnnotation
  );
  return copyComments(classProp, T.objectTypeProperty(key, declaredType));
}

const isIdent = (node: any) => T.isIdentifier(node);

/**
 * Generate a type property representation of the given method.
 * @param method `ClassMethod` node to convert.
 */
export function convertMethodToPropertyAnnot(
  method: T.ClassMethod
): T.ObjectTypeProperty {
  const key = method.key;
  const declaredType = T.functionTypeAnnotation(
    method.typeParameters,
    method.params.filter(isIdent).map(convertFunctionParamToFunctionTypeParam),
    null,
    maybeTypeOrExistential(method.returnType)
  );
  return copyComments(method, T.objectTypeProperty(key, declaredType));
}

export function convertClassMemberToPropertyAnnot(
  member: T.Node
): null | T.ObjectTypeProperty {
  switch (member.type) {
    case "ClassProperty":
      return convertClassPropertyToPropertyAnnot(member as T.ClassProperty);
    case "ClassMethod":
      return convertMethodToPropertyAnnot(member as T.ClassMethod);
    default:
      return null;
  }
}

/**
 * Create an array of property type annotations for a class.
 *
 * @param classBody Array of members (properties, methods) of the class.
 */
export default function collectPropertyTypes(
  classBody: Array<T.Node>
): Array<T.ObjectTypeProperty> {
  return classBody.map(convertClassMemberToPropertyAnnot).filter(Boolean);
}
